import { Server as HttpServer } from 'http';
import { Server } from 'socket.io';

export class WebSocketServer {

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
            console.log(`Client connected: ${socket.id} from ${host}`);

             

            socket.on('disconnect', () => {
                console.log('Client disconnected:', socket.id);
            });
        });
    }

}