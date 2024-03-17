import { Callback } from './EventDispatcher';
import Window from './Window';

interface Command {
    type: string,
    description?: string
}

export default class Consola {
    private window: Window;
    private commands: Command[] = [];

    constructor() {
        this.window = new Window();
        this.bindHandlers();
        this.setupEventListeners();
        this.addCoreCommands();
    }

    public addCommand(type: string, descriptionOrCallback: string | Callback, callback?: Callback) {
        const command: Command = { type };
        if (typeof descriptionOrCallback === 'string') {
            if (callback) this.window.addEventListener(type, callback);
            command.description = descriptionOrCallback;
        } else {
            this.window.addEventListener(type, descriptionOrCallback);
        }
        this.commands.push(command);
    }

    public removeCommand(type: string, callback: Callback) {
        this.window.removeEventListener(type, callback);
    }

    public showMessage(message: string) {
        this.window.showMessage(message);
    }

    public show() {
        this.window.show();
    }

    private bindHandlers() {
        this.keydownHandler = this.keydownHandler.bind(this);
        this.commandCmdlistHandler = this.commandCmdlistHandler.bind(this);
        this.commandClearHandler = this.commandClearHandler.bind(this);
    }

    private setupEventListeners() {
        document.body.addEventListener('keydown', this.keydownHandler);
    }

    private addCoreCommands() {
        this.addCommand('cmdlist', 'Show this list :)', this.commandCmdlistHandler);
        this.addCommand('clear', 'Empty console', this.commandClearHandler);
    }

    private listCommands() {
        let commands = '';
        const list = this.commands.sort((a, b) => {
            if (a.type < b.type) {
                return -1;
            } else if (b.type > a.type) {
                return 1;
            }
            return 0;
        });
        for (const command of list) {
            commands += `${command.type}: ${command.description}<br>`;
        }
        this.window.showMessage(commands);
    }

    private keydownHandler(event: KeyboardEvent) {
        if (event.key === '`') this.window.toggle();
    }

    private commandCmdlistHandler() {
        this.listCommands();
    }

    private commandClearHandler() {
        this.window.clear();
    }
}