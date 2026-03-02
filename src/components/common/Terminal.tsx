import { useEffect, useRef, useCallback } from 'react';
import { Terminal as XTerm } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';
import { useSandboxSocket, SandboxSocketStatus } from '../../hooks/useSandboxSocket';

interface TerminalProps {
  /** User ID — maps to the sandbox container for this user */
  userId: string;
  /** Optional extra class on the wrapper */
  className?: string;
  /** Height of the terminal panel (default 320px) */
  height?: number | string;
}

/**
 * Terminal component — renders an xterm.js terminal panel that connects
 * to the user's isolated Docker sandbox via a WebSocket.
 *
 * Embed inside the code editor playground:
 *   <Terminal userId={currentUser.id} height={300} />
 */
export default function Terminal({ userId, className = '', height = 320 }: TerminalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const xtermRef     = useRef<XTerm | null>(null);
  const fitAddonRef  = useRef<FitAddon | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  // ── Initialise xterm.js once ─────────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current) return;

    const term = new XTerm({
      theme: {
        background:  '#1e1e2e',
        foreground:  '#cdd6f4',
        cursor:      '#f5c2e7',
        black:       '#45475a',
        red:         '#f38ba8',
        green:       '#a6e3a1',
        yellow:      '#f9e2af',
        blue:        '#89b4fa',
        magenta:     '#f5c2e7',
        cyan:        '#94e2d5',
        white:       '#bac2de',
        brightBlack: '#585b70',
        brightRed:   '#f38ba8',
        brightGreen: '#a6e3a1',
        brightYellow:'#f9e2af',
        brightBlue:  '#89b4fa',
        brightMagenta:'#f5c2e7',
        brightCyan:  '#94e2d5',
        brightWhite: '#a6adc8',
      },
      fontFamily: '"Cascadia Code", "Fira Code", "JetBrains Mono", monospace',
      fontSize: 13,
      lineHeight: 1.4,
      cursorBlink: true,
      scrollback: 5000,
      convertEol: true,
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(containerRef.current);
    fitAddon.fit();

    xtermRef.current    = term;
    fitAddonRef.current = fitAddon;

    // ResizeObserver → re-fit terminal when panel dimensions change
    const ro = new ResizeObserver(() => {
      try { fitAddon.fit(); } catch (_) { /* ignore during teardown */ }
    });
    ro.observe(containerRef.current);
    resizeObserverRef.current = ro;

    return () => {
      ro.disconnect();
      term.dispose();
    };
  }, []);

  // ── Write output to xterm ──────────────────────────────────────────────
  const handleOutput = useCallback((data: string) => {
    xtermRef.current?.write(data);
  }, []);

  // ── Status change handler ────────────────────────────────────────────
  const handleStatusChange = useCallback((s: SandboxSocketStatus) => {
    const term = xtermRef.current;
    if (!term) return;
    switch (s) {
      case 'connecting':
        term.writeln('\r\n\x1b[33m⧗ Connecting to sandbox…\x1b[0m');
        break;
      case 'ready':
        term.writeln('\r\x1b[32m✔ Sandbox ready\x1b[0m\r\n');
        break;
      case 'paused':
        term.writeln('\r\n\x1b[33m⏸  Sandbox paused (idle timeout)\x1b[0m');
        break;
      case 'error':
        term.writeln('\r\n\x1b[31m✖ Sandbox error — try reconnecting\x1b[0m');
        break;
      case 'disconnected':
        term.writeln('\r\n\x1b[90mDisconnected\x1b[0m');
        break;
    }
  }, []);

  const handleError = useCallback((message: string) => {
    xtermRef.current?.writeln(`\r\n\x1b[31m[Error] ${message}\x1b[0m`);
  }, []);

  // ── WebSocket connection ─────────────────────────────────────────────
  const { status, sendInput, sendResize, connect } = useSandboxSocket({
    userId,
    onOutput:       handleOutput,
    onStatusChange: handleStatusChange,
    onError:        handleError,
  });

  // ── Forward xterm keystrokes → WebSocket ──────────────────────────────
  useEffect(() => {
    const term = xtermRef.current;
    if (!term) return;
    const disposable = term.onData((data: string) => sendInput(data));
    return () => disposable.dispose();
  }, [sendInput]);

  // ── Forward xterm resize → WebSocket ─────────────────────────────────
  useEffect(() => {
    const term = xtermRef.current;
    if (!term) return;
    const disposable = term.onResize(({ cols, rows }: { cols: number; rows: number }) => {
      sendResize(cols, rows);
    });
    return () => disposable.dispose();
  }, [sendResize]);

  // ── Status badge colour ───────────────────────────────────────────────
  const statusConfig: Record<SandboxSocketStatus, { dot: string; label: string }> = {
    connecting:   { dot: 'bg-yellow-400 animate-pulse', label: 'Connecting…' },
    ready:        { dot: 'bg-green-400',                label: 'Connected'   },
    paused:       { dot: 'bg-yellow-500',               label: 'Paused'      },
    error:        { dot: 'bg-red-500',                  label: 'Error'       },
    disconnected: { dot: 'bg-gray-500',                 label: 'Disconnected'},
  };
  const { dot, label } = statusConfig[status];

  return (
    <div className={`flex flex-col rounded-lg overflow-hidden border border-gray-700 ${className}`}>
      {/* Terminal toolbar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#181825] border-b border-gray-700">
        <div className="flex items-center gap-2">
          {/* macOS-style traffic lights */}
          <span className="w-3 h-3 rounded-full bg-red-500" />
          <span className="w-3 h-3 rounded-full bg-yellow-500" />
          <span className="w-3 h-3 rounded-full bg-green-500" />
          <span className="ml-3 text-xs text-gray-400 font-mono">
            sandbox — /workspace
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Status indicator */}
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${dot}`} />
            <span className="text-xs text-gray-400">{label}</span>
          </div>

          {/* Reconnect button — shown when disconnected or errored */}
          {(status === 'disconnected' || status === 'error' || status === 'paused') && (
            <button
              onClick={connect}
              className="text-xs px-2 py-0.5 rounded bg-blue-600 hover:bg-blue-500 text-white transition-colors"
            >
              Reconnect
            </button>
          )}
        </div>
      </div>

      {/* xterm.js mount point */}
      <div
        ref={containerRef}
        style={{ height: typeof height === 'number' ? `${height}px` : height }}
        className="bg-[#1e1e2e] w-full"
      />
    </div>
  );
}
