import { useEffect, useRef } from "react";
import { Socket } from "socket.io-client";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import "xterm/css/xterm.css";
import { SocketEvents } from "common-types";

const OPTIONS_TERM = {
  cursorBlink: true,
  fontSize: 14,
  fontFamily: "monospace",
  theme: {
    background: "#000000",
  },
};

export const TerminalComponent = ({ socket }: { socket: Socket }) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const termRef = useRef<Terminal | null>(null);

  useEffect(() => {
    if (!terminalRef.current || !socket) return;

    const term = new Terminal(OPTIONS_TERM);
    const fitAddon = new FitAddon();

    termRef.current = term;

    term.loadAddon(fitAddon);
    term.open(terminalRef.current);
    fitAddon.fit();
    term.focus();

    // Refit once layout settles (the container may be 0-sized on first paint).
    const refit = setTimeout(() => {
      fitAddon.fit();
      term.focus();
    }, 50);

    // Clicking anywhere in the terminal returns keyboard focus to it.
    const container = terminalRef.current;
    const focusTerm = () => term.focus();
    container.addEventListener("click", focusTerm);

    socket.emit(SocketEvents.REQUEST_TERMINAL);

    const handleOutput = ({ data }: { data: string }) => {
      term.write(data);
    };

    socket.on(SocketEvents.TERMINAL_OUTPUT, handleOutput);

    term.onData((data) => {
      socket.emit(SocketEvents.TERMINAL_INPUT, { data });
    });

    term.onResize(({ cols, rows }) => {
      socket.emit(SocketEvents.TERMINAL_RESIZE, { cols, rows });
    });

    const handleExit = ({ exitCode }: { exitCode: number }) => {
      term.write(`\r\n\n[Process exited with code ${exitCode}]\r\n`);
    };

    socket.on(SocketEvents.TERMINAL_EXIT, handleExit);

    const handleWindowResize = () => {
      fitAddon.fit();
    };

    window.addEventListener("resize", handleWindowResize);

    socket.emit(SocketEvents.TERMINAL_INPUT, { data: "\n" });

    return () => {
      socket.off(SocketEvents.TERMINAL_OUTPUT, handleOutput);
      socket.off(SocketEvents.TERMINAL_EXIT, handleExit);
      window.removeEventListener("resize", handleWindowResize);
      container.removeEventListener("click", focusTerm);
      clearTimeout(refit);

      term.dispose();
    };
  }, [socket]);

  return (
    <div
      ref={terminalRef}
      style={{
        width: "100%",
        height: "400px",
        backgroundColor: "black",
        borderRadius: "8px",
        overflow: "hidden",
      }}
    />
  );
};
