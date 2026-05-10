import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import { inject, injectable } from "tsyringe";
import cookie from "cookie";
import jwt from "jsonwebtoken";

import { SocketEvents } from "common-types";
import { logger } from "logger";
import { TerminalManager } from "../pty";
import { saveToS3 } from "s3";
import { fileService } from "file-service";
import { UnauthorizedError } from "error-handler";
import { ACCESS_TOKEN_SECRET } from "../../utils/config";

const WORKSPACE_ROOT = process.env.WORKSPACE_ROOT ?? "/workspace";
const CLIENT_URL = process.env.CLIENT_URL ?? "http://localhost:5173";

@injectable()
export class WebSocketService {

    constructor(
        @inject("TerminalManager")
        private terminalManager: TerminalManager
    ) { }

    init(httpServer: HttpServer): void {
        logger.info("Initializing WebSocket server", { clientUrl: CLIENT_URL });

        const io = new Server(httpServer, {
            cors: {
                origin: "*",
                methods: ["GET", "POST"],
                allowedHeaders: ["Content-Type", "Authorization"],
                credentials: true,
            },
        });

        io.use(async (socket, next) => {
            const rawCookies = socket.handshake.headers.cookie;

            if (!rawCookies) {
                logger.warn("WS auth rejected — no cookies", { socketId: socket.id });
                return next(new UnauthorizedError("WS auth rejected - no cookies"))
            }

            const cookies = cookie.parse(rawCookies);
            const access_token = cookies["access_token"];

            if (!access_token) {
                logger.warn("Connection failed - access_token missing", {
                    socketId: socket.id
                });

                return next(new UnauthorizedError("No access found"));
            }

            try {
                const user = jwt.verify(access_token, ACCESS_TOKEN_SECRET, {
                    issuer: "DevForces",
                    audience: "DevForces - API"
                }) as { user_id: string, email: string, role: "USER" | "ADMIN" };

                socket.data.user = user;

                logger.info("WS auth successful", {
                    socketId: socket.id,
                    userId: user.user_id
                });
                
                next();
            } catch (error) {
                logger.error("WS auth rejected - invalid session", {
                    socketId: socket.id
                });

                return next(new UnauthorizedError("WS auth rejected - invalid session"));
            }

        });

        io.on("connection", (socket) => {
            const host = socket.handshake.headers.host;
            const workDir = socket.handshake.query.workDir as string;

            logger.debug("Incoming socket connection", {
                socketId: socket.id,
                host,
                query: socket.handshake.query
            });

            if (!workDir) {
                logger.warn("Connection rejected — missing workDir", { socketId: socket.id });
                socket.disconnect();
                return;
            }

            console.log(workDir)

            logger.info("Client connected", { socketId: socket.id, host, workDir });

            socket.emit(SocketEvents.LOADED, {
                rootContent: fileService.fetchDir("/workspace", "")
            });

            this.initHandlers(socket, workDir);
        });
    }

    private initHandlers(socket: Socket, workDir: string): void {
        const workDirPath = `${WORKSPACE_ROOT}/${workDir}`;

        logger.debug("Initializing socket handlers", {
            socketId: socket.id,
            workDir,
            workDirPath
        });

        socket.on("disconnect", (reason) => {
            logger.info("Client disconnected", {
                socketId: socket.id,
                workDir,
                reason
            });

            this.terminalManager.clear(socket.id);
        });

        socket.on(SocketEvents.FETCH_DIR, async (dir: string, callback) => {
            logger.debug("FETCH_DIR request received", {
                socketId: socket.id,
                dir,
                workDir
            });

            try {
                const fullPath = `${workDirPath}/${dir}`;
                const contents = await fileService.fetchDir(fullPath, dir);

                logger.info("Directory fetched successfully", {
                    socketId: socket.id,
                    dir,
                    workDir
                });

                callback({ success: true, data: contents });
            } catch (err: any) {
                logger.error("Failed to fetch directory", {
                    socketId: socket.id,
                    dir,
                    workDir,
                    error: err.message
                });

                callback({ success: false, error: "Failed to fetch directory" });
            }
        });

        socket.on(SocketEvents.FETCH_CONTENT, async (filePath: string, callback) => {
            logger.debug("FETCH_CONTENT request received", {
                socketId: socket.id,
                filePath,
                workDir
            });

            try {
                const fullPath = `${workDirPath}/${filePath}`;
                const content = await fileService.fetchFileContent(fullPath);

                logger.info("File content fetched successfully", {
                    socketId: socket.id,
                    filePath,
                    workDir
                });

                callback({ success: true, data: content });
            } catch (err: any) {
                logger.error("Failed to fetch file content", {
                    socketId: socket.id,
                    filePath,
                    workDir,
                    error: err.message
                });

                callback({ success: false, error: "Failed to fetch file" });
            }
        });

        socket.on(
            SocketEvents.SAVE_FILE,
            async ({ filePath, content }: { filePath: string; content: string }, callback) => {

                logger.debug("SAVE_FILE request received", {
                    socketId: socket.id,
                    filePath,
                    workDir,
                    contentLength: content?.length
                });

                try {
                    const fullPath = `${workDirPath}/${filePath}`;

                    await fileService.saveFile(fullPath, content);
                    logger.info("File saved locally", {
                        socketId: socket.id,
                        filePath,
                        workDir
                    });

                    await saveToS3('code', fullPath, content);
                    logger.info("File uploaded to S3", {
                        socketId: socket.id,
                        filePath,
                        workDir
                    });

                    callback({ success: true });
                } catch (err: any) {
                    logger.error("Failed to save file", {
                        socketId: socket.id,
                        filePath,
                        workDir,
                        error: err.message
                    });

                    callback({ success: false, error: "Failed to save file" });
                }
            }
        );

        socket.on(SocketEvents.REQUEST_TERMINAL, () => {
            logger.debug("Terminal requested", {
                socketId: socket.id,
                workDir
            });

            if (this.terminalManager.hasSession(socket.id)) {
                logger.warn("Terminal session already exists", {
                    socketId: socket.id
                });
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
                    logger.info("Terminal exited", {
                        socketId: socket.id,
                        workDir,
                        exitCode
                    });

                    socket.emit(SocketEvents.TERMINAL_EXIT, { exitCode });
                }
            );

            logger.info("Terminal session created", {
                socketId: socket.id,
                workDir
            });
        });

        socket.on(SocketEvents.TERMINAL_INPUT, ({ data }: { data: string }) => {
            logger.debug("Terminal input received", {
                socketId: socket.id,
                dataLength: data.length
            });

            this.terminalManager.write(socket.id, data);
        });

        socket.on(SocketEvents.TERMINAL_RESIZE, ({ cols, rows }: { cols: number; rows: number }) => {
            logger.debug("Terminal resized", {
                socketId: socket.id,
                cols,
                rows
            });

            this.terminalManager.resize(socket.id, cols, rows);
        });
    }
}