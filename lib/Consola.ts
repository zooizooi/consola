import Window from './Window';
import Commands, { CommandCallback } from './Commands';

export default class Consola {
    private window: Window;

    constructor() {
        this.window = new Window();
        this.bindHandlers();
        this.setupEventListeners();
        this.addCoreCommands();
    }

    public addCommand(type: string, descriptionOrCallback: string | CommandCallback, callback?: CommandCallback) {
        if (typeof descriptionOrCallback === 'string') {
            if (callback) {
                Commands.set(type, { description: descriptionOrCallback, callback });
            }
        } else {
            Commands.set(type, { callback: descriptionOrCallback });
        }
    }

    public removeCommand(type: string) {
        Commands.delete(type);
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
        const list = Array.from(Commands).sort((a, b) => {
            if (a[0] < b[0]) {
                return -1;
            } else if (b[0] > a[0]) {
                return 1;
            }
            return 0;
        });
        for (const command of list) {
            let output = command[0];
            const description = command[1].description;
            if (description) output += `: ${description}`;
            commands += `${output}<br>`;
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