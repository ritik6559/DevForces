import * as pty from "node-pty";
import os from "os";

const SHELL = os.platform() === "win32" ? "powershell.exe" : "bash";

interface Session {
  terminal: pty.IPty;
  replId: string;
}

export class TerminalManager {
  private sessions: Map<string, Session> = new Map();

  createPty(
    id: string,
    work_dir: string,
    onData: (data: string, pid: number) => void,
    onExit?: (exitCode: number) => void
  ): pty.IPty {
    const term = pty.spawn(SHELL, [], {
      cols: 100,
      rows: 30,
      name: "xterm-256color",   
      cwd: `/workspace/${work}`,   
      env: process.env as { [key: string]: string },
    });

    term.onData((data) => onData(data, term.pid));

    term.onExit(({ exitCode }) => {
      onExit?.(exitCode);
      this.sessions.delete(id);  // use the session id, not term.pid (bug fix)
    });

    this.sessions.set(id, { terminal: term, replId });

    return term;
  }

  write(terminalId: string, data: string): void {
    this.sessions.get(terminalId)?.terminal.write(data);
  }

  resize(terminalId: string, cols: number, rows: number): void {
    this.sessions.get(terminalId)?.terminal.resize(cols, rows);
  }

  clear(terminalId: string): void {
    const session = this.sessions.get(terminalId);
    if (!session) return;
    session.terminal.kill();
    this.sessions.delete(terminalId);
  }

  clearAll(): void {
    this.sessions.forEach((session) => session.terminal.kill());
    this.sessions.clear();
  }

  hasSession(terminalId: string): boolean {
    return this.sessions.has(terminalId);
  }

  getSession(terminalId: string): Session | undefined {
    return this.sessions.get(terminalId);
  }
}