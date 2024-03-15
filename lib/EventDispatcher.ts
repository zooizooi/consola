/**
 * https://github.com/mrdoob/eventdispatcher.js/
 */

type Callback = () => void;
interface Listeners {
    [type: string]: Callback[]
}

export default class EventDispatcher {
    private listeners: Listeners = {};

    public addEventListener(type: string, listener: Callback) {
        if (this.listeners[type] === undefined) {
            this.listeners[type] = [];
        }

        if (this.listeners[type].indexOf(listener) === - 1) {
            this.listeners[type].push(listener);
        }
    }

    public hasEvent(type: string) {
        return this.listeners[type] ? true : false;
    }

    public hasEventListener(type: string, listener: Callback) {
        if (this.listeners === undefined) return false;
        const listeners = this.listeners;
        return listeners[type] !== undefined && listeners[type].indexOf(listener) !== - 1;
    }

    public removeEventListener(type: string, listener: Callback) {
        if (this.listeners === undefined) return;

        const listeners = this.listeners;
        const listenerArray = listeners[type];

        if (listenerArray !== undefined) {
            const index = listenerArray.indexOf(listener);
            if (index !== - 1) {
                listenerArray.splice(index, 1);
            }
        }
    }

    public dispatchEvent(type: string) {
        if (this.listeners === undefined) return;

        const listeners = this.listeners;
        const listenerArray = listeners[type];

        if (listenerArray !== undefined) {
            // Make a copy, in case listeners are removed while iterating.
            const array = listenerArray.slice(0);

            for (let i = 0, l = array.length; i < l; i ++) {
                array[i].call(this);
            }
        }
    }
}