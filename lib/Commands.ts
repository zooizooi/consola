export type CommandValue = number | string | boolean | undefined;
export type CommandCallback = (value: CommandValue) => void;

interface Command {
    description?: string
    callback: CommandCallback;
}

class Commands extends Map<string, Command> {
    public history: string[] = [];

    public execute(type: string, value: CommandValue) {
        this.addToHistory(type, value);
        const command = this.get(type);
        if (command) {
            command.callback(value);
            return true;
        }
        return false;
    }

    private addToHistory(type: string, value: CommandValue) {
        let historyValue = type;
        if (value) historyValue += ` ${value}`;
        this.history.push(historyValue);
    }
}

export default new Commands();