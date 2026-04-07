import { Server as HttpServer } from 'http';
import { Server } from 'socket.io';
import { logger } from '../../libs/logger';

export class WebSocketService {

    static init( httpServer: HttpServer ) {
        const io = new Server( httpServer, {
            cors: {
                origin: "http://localhost:5173",
                methods: ["GET", "POST"],
                allowedHeaders: ["Content-Type", "Authorization"],
                credentials: true
            }
        });

        io.on('connection', (socket) => {
            const host = socket.handshake.headers.host;
            logger.info('Client connected', { socketId: socket.id, host });



            socket.on('disconnect', () => {
                logger.info('Client disconnected', { socketId: socket.id });
            });
        });
    }

}