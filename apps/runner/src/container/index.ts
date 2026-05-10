import { container } from "tsyringe";
import { TerminalManager } from "../modules/pty";
import { WebSocketService } from "../modules/web-socket";

export class DIContainer {
    static setup(): void {
        const terminalManager = new TerminalManager();
        const webSocketService = new WebSocketService(terminalManager);

        container.registerInstance("TerminalManager", terminalManager);
        container.registerInstance("WebSocketService", webSocketService);
    }
}