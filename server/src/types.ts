// ─── Shared types for the sandbox server ─────────────────────────────────────

export type SandboxStatus = 'running' | 'paused' | 'stopped' | 'error';

export type SandboxImage =
  | 'node:20-alpine'
  | 'ubuntu:22.04'
  | 'python:3.12-slim';

/** Persisted record stored in sandbox_containers table */
export interface SandboxContainer {
  id: string;
  userId: string;
  companyId: string;
  containerId: string;   // Docker container ID
  containerName: string; // sandbox-{userId}
  status: SandboxStatus;
  volumePath: string;    // /sandboxes/{userId}
  port: number;
  image: SandboxImage;
  storageQuotaMb: number;
  createdAt: Date;
  lastActiveAt: Date;
}

/** In-memory active terminal session (not persisted) */
export interface TerminalSession {
  sessionId: string;
  userId: string;
  containerId: string;
  socket: import('ws').WebSocket;
  startedAt: Date;
  idleTimer?: ReturnType<typeof setTimeout>;
}

/** WebSocket message: client → server */
export type ClientMessage =
  | { type: 'input'; data: string }
  | { type: 'resize'; cols: number; rows: number };

/** WebSocket message: server → client */
export type ServerMessage =
  | { type: 'output'; data: string }
  | { type: 'status'; status: SandboxStatus | 'connecting' | 'ready' }
  | { type: 'error'; message: string };

/** Payload for provisioning a new sandbox */
export interface SandboxProvisionRequest {
  userId: string;
  companyId: string;
  image?: SandboxImage;
  storageQuotaMb?: number;
}
