import { container } from "tsyringe";
import { TerminalManager } from "../modules/pty";
import { WebSocketService } from "../modules/web-socket";

export class DIContainer {
    static setup(): void {
        container.registerSingleton('TerminalManager', TerminalManager);
        container.registerSingleton('WebSocketService', WebSocketService);
    }
}