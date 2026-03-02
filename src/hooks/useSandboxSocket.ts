import { useEffect, useRef, useCallback, useState } from 'react';

// ─── WebSocket message types (mirror server/src/types.ts) ───────────────────────

type ClientMessage =
  | { type: 'input'; data: string }
  | { type: 'resize'; cols: number; rows: number };

type ServerMessage =
  | { type: 'output'; data: string }
  | { type: 'status'; status: string }
  | { type: 'error'; message: string };

export type SandboxSocketStatus =
  | 'disconnected'
  | 'connecting'
  | 'ready'
  | 'paused'
  | 'error';

interface UseSandboxSocketOptions {
  userId: string;
  /** Called when terminal output arrives from the container */
  onOutput: (data: string) => void;
  /** Called on status change */
  onStatusChange?: (status: SandboxSocketStatus) => void;
  /** Called on error message */
  onError?: (message: string) => void;
  /** WebSocket URL override (defaults to Vite proxy path) */
  wsUrl?: string;
}

/**
 * Manages the WebSocket connection to the sandbox server.
 * Provides sendInput and sendResize helpers.
 *
 * The WebSocket connects to /ws/sandbox/{userId} which Vite
 * proxies to ws://localhost:4010/ws/sandbox/{userId} in dev.
 */
export function useSandboxSocket(options: UseSandboxSocketOptions) {
  const { userId, onOutput, onStatusChange, onError, wsUrl } = options;

  const socketRef    = useRef<WebSocket | null>(null);
  const [status, setStatus] = useState<SandboxSocketStatus>('disconnected');
  const isMounted    = useRef(true);

  const updateStatus = useCallback((s: SandboxSocketStatus) => {
    if (!isMounted.current) return;
    setStatus(s);
    onStatusChange?.(s);
  }, [onStatusChange]);

  const connect = useCallback(() => {
    if (socketRef.current?.readyState === WebSocket.OPEN) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const url = wsUrl ?? `${protocol}//${window.location.host}/ws/sandbox/${userId}`;

    updateStatus('connecting');
    const ws = new WebSocket(url);
    socketRef.current = ws;

    ws.onopen = () => {
      console.log(`[SandboxSocket] Connected for userId=${userId}`);
    };

    ws.onmessage = (event: MessageEvent) => {
      try {
        const msg: ServerMessage = JSON.parse(event.data as string);
        switch (msg.type) {
          case 'output':
            onOutput(msg.data);
            break;
          case 'status':
            updateStatus(msg.status as SandboxSocketStatus);
            break;
          case 'error':
            console.error('[SandboxSocket] Error:', msg.message);
            onError?.(msg.message);
            updateStatus('error');
            break;
        }
      } catch {
        // Non-JSON message — pass through as raw output
        onOutput(event.data as string);
      }
    };

    ws.onclose = (event) => {
      console.log(`[SandboxSocket] Closed (code=${event.code}) for userId=${userId}`);
      if (isMounted.current) updateStatus('disconnected');
    };

    ws.onerror = () => {
      console.error(`[SandboxSocket] WebSocket error for userId=${userId}`);
      if (isMounted.current) updateStatus('error');
    };
  }, [userId, wsUrl, onOutput, onError, updateStatus]);

  /** Send raw keystroke data to the container */
  const sendInput = useCallback((data: string) => {
    if (socketRef.current?.readyState !== WebSocket.OPEN) return;
    const msg: ClientMessage = { type: 'input', data };
    socketRef.current.send(JSON.stringify(msg));
  }, []);

  /** Send terminal resize event */
  const sendResize = useCallback((cols: number, rows: number) => {
    if (socketRef.current?.readyState !== WebSocket.OPEN) return;
    const msg: ClientMessage = { type: 'resize', cols, rows };
    socketRef.current.send(JSON.stringify(msg));
  }, []);

  /** Manually disconnect */
  const disconnect = useCallback(() => {
    socketRef.current?.close();
  }, []);

  // Auto-connect on mount, cleanup on unmount
  useEffect(() => {
    isMounted.current = true;
    connect();
    return () => {
      isMounted.current = false;
      socketRef.current?.close();
    };
  }, [connect]);

  return { status, sendInput, sendResize, connect, disconnect };
}
