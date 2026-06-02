import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import { inject, injectable } from "tsyringe";
import cookie from "cookie";
import jwt from "jsonwebtoken";

import { SocketEvents, hashContent, applyContentPatch } from "common-types";
import type { UpdateContentPayload, UpdateContentAck } from "common-types";
import { logger } from "logger";
import { TerminalManager } from "../pty";
import { buildUserCodeKey, putS3Content } from "s3";
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
                origin: (origin, callback) => {
                    // Allow localhost dev + your production domain
                    const allowed = [
                        "http://localhost:5173",
                        /^https?:\/\/.*\.ritik\.fun$/,
                    ];
                    if (!origin || allowed.some(p => typeof p === "string" ? p === origin : p.test(origin))) {
                        callback(null, true);
                    } else {
                        callback(new Error("Not allowed by CORS"));
                    }
                },
                methods: ["GET", "POST"],
                credentials: true,
            },
        });

        // WebSocket authentication.
        //
        // Disabled by default (RUNNER_WS_AUTH !== "true") to preserve the
        // current IDE flow: the browser connects cross-origin to the pod's
        // ingress, so the http-backend cookie is NOT sent and no token is
        // available in the handshake. Turning this on requires the client to
        // pass a token via `io(url, { auth: { token } })` (or `?token=`).
        //
        // When enabled, the token is verified with the correct audience
        // ("DevForces-API" — the previously commented code used the wrong
        // "DevForces - API" value and would always have failed).
        if (process.env.RUNNER_WS_AUTH === "true") {
            io.use((socket, next) => {
                try {
                    const fromAuth = (socket.handshake.auth?.token as string | undefined);
                    const fromQuery = (socket.handshake.query?.token as string | undefined);
                    const fromCookie = socket.handshake.headers.cookie
                        ? cookie.parse(socket.handshake.headers.cookie)["access_token"]
                        : undefined;

                    const token = fromAuth || fromQuery || fromCookie;

                    if (!token) {
                        logger.warn("WS auth rejected — missing token", { socketId: socket.id });
                        return next(new UnauthorizedError("WS auth: missing token"));
                    }

                    const user = jwt.verify(token, ACCESS_TOKEN_SECRET, {
                        issuer: "DevForces",
                        audience: "DevForces-API",
                    }) as { user_id: string; email: string; role: "USER" | "ADMIN" };

                    socket.data.user = user;

                    logger.info("WS auth successful", { socketId: socket.id, userId: user.user_id });
                    next();
                } catch (error) {
                    logger.error("WS auth rejected — invalid token", {
                        socketId: socket.id,
                        error: error instanceof Error ? error.message : "Unknown error",
                    });
                    next(new UnauthorizedError("WS auth: invalid token"));
                }
            });
        }

        io.on("connection", async (socket) => {
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

            logger.info("Client connected", { socketId: socket.id, host, workDir });

            try {
                const rootContent = await fileService.fetchDir(
                    `${WORKSPACE_ROOT}/${workDir}`,  // e.g. /workspace/contestId/challengeId/userId
                    ""
                );

                logger.info("Root content fetched", {
                    socketId: socket.id,
                    workDir,
                    path: `${WORKSPACE_ROOT}/${workDir}`,
                    fileCount: rootContent.length,
                    files: rootContent.map(f => f.path)  // see what actually came back
                });

                socket.emit(SocketEvents.LOADED, { rootContent });

                logger.info("Workspace loaded and sent to client", {
                    socketId: socket.id,
                    workDir,
                    fileCount: rootContent.length
                });
            } catch (err: any) {
                logger.error("Failed to fetch workspace root", {
                    socketId: socket.id,
                    workDir,
                    error: err.message
                });

                socket.emit(SocketEvents.LOADED, { rootContent: [] });
            }

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

                    const key = buildUserCodeKey(workDir, filePath);
                    await putS3Content(key, content);
                    logger.info("File uploaded to S3", {
                        socketId: socket.id,
                        filePath,
                        workDir,
                        key
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

        socket.on(
            SocketEvents.UPDATE_CONTENT,
            async (
                { path: filePath, patch, baseHash, newHash }: UpdateContentPayload,
                callback?: (ack: UpdateContentAck) => void
            ) => {
                const ack = (res: UpdateContentAck) => callback?.(res);

                logger.debug("UPDATE_CONTENT request received", {
                    socketId: socket.id,
                    filePath,
                    workDir,
                    patchLength: patch?.length
                });

                try {
                    const fullPath = `${workDirPath}/${filePath}`;

                    // The live workspace file is the source of truth in the pod.
                    let current = "";
                    try {
                        current = await fileService.fetchFileContent(fullPath);
                    } catch {
                        current = ""; // new file — patch is created against empty content
                    }

                    // Reject patches built against a stale base so we never apply
                    // a diff to the wrong content and silently corrupt the file.
                    if (hashContent(current) !== baseHash) {
                        logger.warn("UPDATE_CONTENT base drift — requesting resync", {
                            socketId: socket.id,
                            filePath,
                            workDir
                        });
                        return ack({ success: false, resync: true, content: current });
                    }

                    const updated = applyContentPatch(current, patch);
                    if (updated === null) {
                        logger.warn("UPDATE_CONTENT patch failed to apply — requesting resync", {
                            socketId: socket.id,
                            filePath,
                            workDir
                        });
                        return ack({ success: false, resync: true, content: current });
                    }

                    // Integrity guard: the reconstructed content must match what
                    // the client expects, otherwise rebase from the server copy.
                    if (hashContent(updated) !== newHash) {
                        logger.warn("UPDATE_CONTENT result hash mismatch — requesting resync", {
                            socketId: socket.id,
                            filePath,
                            workDir
                        });
                        return ack({ success: false, resync: true, content: current });
                    }

                    await fileService.saveFile(fullPath, updated);

                    const key = buildUserCodeKey(workDir, filePath);
                    await putS3Content(key, updated);

                    logger.info("File patched locally and synced to S3", {
                        socketId: socket.id,
                        filePath,
                        workDir,
                        key
                    });

                    ack({ success: true });
                } catch (err: any) {
                    logger.error("Failed to apply content patch", {
                        socketId: socket.id,
                        filePath,
                        workDir,
                        error: err.message
                    });

                    ack({ success: false, error: "Failed to update file" });
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