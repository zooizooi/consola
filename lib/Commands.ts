import { LocalStorage } from '@zooizooi/utils';

export type CommandValue = number | string | boolean | undefined;
export type CommandCallback = (value: CommandValue) => void;

interface Command {
    description?: string
    callback: CommandCallback;
}

const LOCAL_STORAGE_KEY = 'command-history';

class Commands extends Map<string, Command> {
    get history() {
        return LocalStorage.get(LOCAL_STORAGE_KEY);
    }

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
        if (!LocalStorage.get(LOCAL_STORAGE_KEY)) {
            LocalStorage.set(LOCAL_STORAGE_KEY, []);
        }

        const history = LocalStorage.get(LOCAL_STORAGE_KEY);
        if (history) {
            let historyValue = type;
            if (value) historyValue += ` ${value}`;
            if (historyValue) {
                history.push(historyValue);
                LocalStorage.set(LOCAL_STORAGE_KEY, history);
            }
        }
    }
}

export default new Commands();