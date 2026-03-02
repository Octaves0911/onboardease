import { WebSocket } from 'ws';
import Dockerode from 'dockerode';
import { execInContainer, resizeExec } from './container-manager';
import { ClientMessage, ServerMessage } from './types';

/**
 * Opens a Docker exec PTY session inside a container and bridges
 * its I/O bidirectionally to the provided WebSocket.
 *
 * Protocol:
 *   Client → { type: 'input',  data: string }  → written to container stdin
 *   Client → { type: 'resize', cols, rows }     → resize PTY
 *   Container stdout/stderr → { type: 'output', data: base64 } → forwarded to client
 */
export async function bridgePTY(
  containerId: string,
  socket: WebSocket
): Promise<{ exec: Dockerode.Exec; stream: NodeJS.ReadWriteStream }> {
  const { exec, stream } = await execInContainer(containerId);

  // ── Container → Client ─────────────────────────────────────────────────────
  stream.on('data', (chunk: Buffer) => {
    if (socket.readyState !== WebSocket.OPEN) return;
    const msg: ServerMessage = { type: 'output', data: chunk.toString('utf8') };
    socket.send(JSON.stringify(msg));
  });

  stream.on('error', (err: Error) => {
    console.error('[PTYBridge] Stream error:', err.message);
    if (socket.readyState === WebSocket.OPEN) {
      const msg: ServerMessage = { type: 'error', message: 'Terminal stream error' };
      socket.send(JSON.stringify(msg));
    }
  });

  stream.on('end', () => {
    if (socket.readyState === WebSocket.OPEN) {
      const msg: ServerMessage = { type: 'status', status: 'stopped' };
      socket.send(JSON.stringify(msg));
    }
  });

  // ── Client → Container ─────────────────────────────────────────────────────
  socket.on('message', async (raw: Buffer | string) => {
    try {
      const msg: ClientMessage = JSON.parse(raw.toString());

      if (msg.type === 'input') {
        // Write keystrokes to container stdin
        if (stream.writable) {
          stream.write(msg.data);
        }
      } else if (msg.type === 'resize') {
        await resizeExec(exec, msg.cols, msg.rows);
      }
    } catch {
      // Ignore malformed messages
    }
  });

  return { exec, stream };
}
