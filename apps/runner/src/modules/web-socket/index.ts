import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import { container, injectable } from "tsyringe";
import { SocketEvents } from "common-types";

import { logger } from "../../libs/logger";
import { FileService } from "../file-service";
import { TerminalManager } from "../pty";

const WORKSPACE_ROOT = process.env.WORKSPACE_ROOT ?? "/workspace";
const CLIENT_URL = process.env.CLIENT_URL ?? "http://localhost:5173";

@injectable()
export class WebSocketService {

    constructor(
        private fileService: FileService,
        private terminalManager: TerminalManager) {}

    init(httpServer: HttpServer): void {
        const io = new Server(httpServer, {
            cors: {
                origin: CLIENT_URL,
                methods: ["GET", "POST"],
                allowedHeaders: ["Content-Type", "Authorization"],
                credentials: true,
            },
        });

        io.on("connection", (socket) => {
            const host = socket.handshake.headers.host;

            const workDir = socket.handshake.query.workDir as string;

            if (!workDir) {
                logger.warn("Connection rejected — missing workDir", { socketId: socket.id });
                socket.disconnect();
                return;
            }

            logger.info("Client connected", { socketId: socket.id, host, workDir });

            this.initHandlers(socket, workDir);
        });
    }

    private initHandlers(socket: Socket, workDir: string): void {
        const workDirPath = `${WORKSPACE_ROOT}/${workDir}`;

        socket.on("disconnect", (reason) => {
            logger.info("Client disconnected", { socketId: socket.id, workDir, reason });
            this.terminalManager.clear(socket.id);
        });

        socket.on(SocketEvents.FETCH_DIR, async (dir: string, callback) => {
            try {
                const fullPath = `${workDirPath}/${dir}`;
                const contents = await this.fileService.fetchDir(fullPath, dir);
                callback({ success: true, data: contents });
            } catch (err: any) {
                logger.error("Failed to fetch directory", { dir, workDir, error: err.message });
                callback({ success: false, error: "Failed to fetch directory" });
            }
        });

        socket.on(SocketEvents.FETCH_CONTENT, async (filePath: string, callback) => {
            try {
                const fullPath = `${workDirPath}/${filePath}`;
                const content = await this.fileService.fetchFileContent(fullPath);
                callback({ success: true, data: content });
            } catch (err: any) {
                logger.error("Failed to fetch file content", { filePath, workDir, error: err.message });
                callback({ success: false, error: "Failed to fetch file" });
            }
        });

        socket.on(SocketEvents.SAVE_FILE, async ({ filePath, content }: { filePath: string; content: string }, callback) => {
            try {
                const fullPath = `${workDirPath}/${filePath}`;
                await this.fileService.saveFile(fullPath, content);
                callback({ success: true });
            } catch (err: any) {
                logger.error("Failed to save file", { filePath, workDir, error: err.message });
                callback({ success: false, error: "Failed to save file" });
            }
        });

        socket.on(SocketEvents.REQUEST_TERMINAL, () => {
            if (this.terminalManager.hasSession(socket.id)) {
                return;
            }

            this.terminalManager.createPty(
                socket.id,
                workDirPath,
                (data) => {
                    socket.emit(SocketEvents.TERMINAL_OUTPUT, {
                        data: Buffer.from(data, "utf-8"),
                    });
                },
                (exitCode) => {
                    logger.info("Terminal exited", { socketId: socket.id, workDir, exitCode });
                    socket.emit(SocketEvents.TERMINAL_EXIT, { exitCode });
                }
            );
        });

        socket.on(SocketEvents.TERMINAL_INPUT, ({ data }: { data: string }) => {
            this.terminalManager.write(socket.id, data);
        });

        socket.on(SocketEvents.TERMINAL_RESIZE, ({ cols, rows }: { cols: number; rows: number }) => {
            this.terminalManager.resize(socket.id, cols, rows);
        });
    }
}