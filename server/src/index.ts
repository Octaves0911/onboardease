import 'dotenv/config';
import express from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { URL } from 'url';

import {
  createContainer,
  resumeContainer,
  pauseContainer,
} from './container-manager';
import {
  findSandbox,
  createSandboxRecord,
  updateSandboxStatus,
} from './db';
import { bridgePTY } from './pty-bridge';
import { setSession, removeSession, getSession } from './session-store';
import { onUserDeleted } from './lifecycle-handler';
import { ServerMessage, SandboxProvisionRequest } from './types';

const PORT   = Number(process.env.SANDBOX_PORT ?? 4010);
const IDLE_TIMEOUT_MS = Number(process.env.IDLE_TIMEOUT_MS ?? 30 * 60 * 1000); // 30 min

// ─── Express REST API ────────────────────────────────────────────────────────

const app = express();
app.use(express.json());

/** Health check */
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'sandbox-server', port: PORT });
});

/** Provision sandbox (REST endpoint — primarily called server-side) */
app.post('/sandbox/provision', async (req, res) => {
  const body = req.body as SandboxProvisionRequest;
  if (!body.userId) return res.status(400).json({ error: 'userId required' });
  if (!body.companyId) return res.status(400).json({ error: 'companyId required' });

  try {
    const existing = await findSandbox(body.userId);
    if (existing) return res.json(existing);

    const { containerId, containerName, volumePath } = await createContainer(body);
    const record = await createSandboxRecord({
      userId: body.userId,
      companyId: body.companyId,
      containerId,
      containerName,
      status: 'running',
      volumePath,
      port: 0,
      image: body.image ?? 'node:20-alpine',
      storageQuotaMb: body.storageQuotaMb ?? 512,
    });
    return res.status(201).json(record);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ error: msg });
  }
});

/** Trigger user.deleted teardown (called by main webapp on user removal) */
app.delete('/sandbox/:userId', async (req, res) => {
  try {
    await onUserDeleted({ userId: req.params.userId });
    res.json({ message: `Sandbox for ${req.params.userId} destroyed` });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: msg });
  }
});

/** Get sandbox status for a user */
app.get('/sandbox/:userId', async (req, res) => {
  const sandbox = await findSandbox(req.params.userId);
  if (!sandbox) return res.status(404).json({ error: 'No sandbox found' });
  res.json(sandbox);
});

// ─── HTTP + WebSocket Server ─────────────────────────────────────────────────

const server = http.createServer(app);
const wss    = new WebSocketServer({ noServer: true });

/**
 * Upgrade handler: routes WebSocket connections from
 * ws://localhost:4010/ws/sandbox/{userId}
 */
server.on('upgrade', (request, socket, head) => {
  const { pathname } = new URL(request.url ?? '/', `http://localhost:${PORT}`);
  const match = pathname.match(/^\/ws\/sandbox\/([^/]+)$/);

  if (!match) {
    socket.destroy();
    return;
  }

  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit('connection', ws, request, match[1]);
  });
});

// ─── WebSocket Connection Handler ────────────────────────────────────────────

wss.on('connection', async (socket: WebSocket, _request: http.IncomingMessage, userId: string) => {
  console.log(`[SandboxServer] WS connected: userId=${userId}`);

  const sendMsg = (msg: ServerMessage) => {
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(msg));
    }
  };

  sendMsg({ type: 'status', status: 'connecting' });

  try {
    // ── 1. Provision or resume sandbox ──────────────────────────────────────
    let sandbox = await findSandbox(userId);

    if (!sandbox) {
      // First launch: create container + DB record
      const companyId = 'default'; // Replace with JWT-extracted companyId in production
      const { containerId, containerName, volumePath } = await createContainer({
        userId,
        companyId,
        image: 'node:20-alpine',
        storageQuotaMb: 512,
      });
      sandbox = await createSandboxRecord({
        userId, companyId, containerId, containerName,
        status: 'running', volumePath, port: 0,
        image: 'node:20-alpine', storageQuotaMb: 512,
      });
    } else {
      // Resume paused/stopped container
      await resumeContainer(sandbox.containerId);
      await updateSandboxStatus(userId, 'running');
    }

    sendMsg({ type: 'status', status: 'ready' });

    // ── 2. Bridge PTY ────────────────────────────────────────────────────────
    const { stream } = await bridgePTY(sandbox.containerId, socket);

    // ── 3. Track session ─────────────────────────────────────────────────────
    const session = {
      sessionId: `${userId}-${Date.now()}`,
      userId,
      containerId: sandbox.containerId,
      socket,
      startedAt: new Date(),
    };
    setSession(userId, session);

    // ── 4. Disconnect handler — pause container after idle timeout ───────────
    socket.on('close', () => {
      console.log(`[SandboxServer] WS disconnected: userId=${userId}`);

      // Cancel any existing idle timer
      const existing = getSession(userId);
      if (existing?.idleTimer) clearTimeout(existing.idleTimer);

      // Close PTY stream
      try { stream.end(); } catch (_) { /* ignore */ }

      // Start idle timer — pause container after 30 min
      const idleTimer = setTimeout(async () => {
        await pauseContainer(sandbox!.containerId);
        await updateSandboxStatus(userId, 'paused');
        removeSession(userId);
        console.log(`[SandboxServer] Container paused (idle): userId=${userId}`);
      }, IDLE_TIMEOUT_MS);

      // Store timer on session so it can be cancelled on reconnect
      setSession(userId, { ...session, idleTimer });
    });

    socket.on('error', (err) => {
      console.error(`[SandboxServer] WS error for userId=${userId}:`, err.message);
    });

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[SandboxServer] Failed to provision sandbox for userId=${userId}:`, msg);
    sendMsg({ type: 'error', message: `Failed to start sandbox: ${msg}` });
    socket.close(1011, 'Sandbox provisioning failed');
  }
});

// ─── Start ───────────────────────────────────────────────────────────────────

server.listen(PORT, () => {
  console.log(`[SandboxServer] Listening on :${PORT}`);
  console.log(`[SandboxServer] WebSocket endpoint: ws://localhost:${PORT}/ws/sandbox/:userId`);
  console.log(`[SandboxServer] REST endpoints:`);
  console.log(`  GET  http://localhost:${PORT}/health`);
  console.log(`  POST http://localhost:${PORT}/sandbox/provision`);
  console.log(`  GET  http://localhost:${PORT}/sandbox/:userId`);
  console.log(`  DELETE http://localhost:${PORT}/sandbox/:userId`);
});

export default server;
