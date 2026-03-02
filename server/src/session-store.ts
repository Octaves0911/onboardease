import { TerminalSession } from './types';

/**
 * In-memory store for active WebSocket ↔ PTY terminal sessions.
 * Key: userId
 */
const sessions = new Map<string, TerminalSession>();

export function setSession(userId: string, session: TerminalSession): void {
  sessions.set(userId, session);
}

export function getSession(userId: string): TerminalSession | undefined {
  return sessions.get(userId);
}

export function removeSession(userId: string): void {
  const session = sessions.get(userId);
  if (session?.idleTimer) clearTimeout(session.idleTimer);
  sessions.delete(userId);
}

export function getAllSessions(): IterableIterator<TerminalSession> {
  return sessions.values();
}

export function hasSession(userId: string): boolean {
  return sessions.has(userId);
}
