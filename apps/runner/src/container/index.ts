import { container } from "tsyringe";
import { TerminalManager } from "../modules/pty";
import { WebSocketService } from "../modules/web-socket";
import { FileService } from "../modules/file-service";

export class DIContainer {
    static setup(): void {
        container.registerSingleton('TerminalManager', TerminalManager);
        container.registerSingleton('WebSocketService', WebSocketService);
        container.registerSingleton('FileService', FileService);
    }
}