import { traverseDOM } from './utils';
import Commands from './Commands';

const template = `
    <div class="consola-window">
        <div class="header">
            <span class="title">ZOOIZOOI Console</span>
            <button class="button button-minimize" ref="buttonMinimize">
                <div class="icon icon-minimize" ref="iconMinimize"></div>
                <div class="icon icon-maximize" ref="iconMaximize"></div>
            </button>
            <button class="button button-close" ref="buttonClose">
                <div class="icon">
                    <div class="line line1"></div>
                    <div class="line line2"></div>
                </div>
            </button>
        </div>
        <div class="body" ref="body">
            <ul class="output" ref="output"></ul>
            <div class="input-container">
                <div class="pointer">&gt;</div>
                <input class="input" ref="input" />
            </div>
            <div class="footer">
                <button class="button button-resize" ref="buttonResize">
                    <div class="icon">
                        <div class="lines">
                            <div class="line line1"></div>
                            <div class="line line2"></div>
                            <div class="line line3"></div>
                        </div>
                    </div>
                </button>
            </div>
        </div>
    </div>
`;

const MARGIN = 25;

interface References {
    [ref: string]: any;
}

interface Input {
    type: string;
    value: number | string | boolean | undefined;
}

export default class Window {
    private references: References;
    private window: HTMLElement;
    private isVisible = false;
    private dimensions: { width: number, height: number } = { width: 0, height: 0 };
    private buttonResizeIsMouseDown = false;
    private buttonResizePosition: { x: number, y: number } = { x: 0, y: 0 };
    private isCustomSize = false;
    private isMinimized = false;
    private commandHistoryIndex = 0;

    constructor() {
        this.window = this.parseTemplate(template);
        this.references = this.parseReferences(this.window);
        this.injectCss();
        this.bindHandlers();
        this.setupEventListeners();
        this.resize();
        document.body.appendChild(this.window);
    }

    public toggle() {
        if (this.isVisible) {
            this.hide();
        } else {
            this.show();
        }
    }

    public show() {
        this.window.style.visibility = 'visible';
        this.isVisible = true;
        setTimeout(() => this.references.input.focus(), 0); // Note: to prevent backtick showing up in the input field
    }

    public hide() {
        this.window.style.visibility = 'hidden';
        this.isVisible = false;
    }

    public toggleMinimize() {
        if (this.isMinimized) {
            this.maximize();
        } else {
            this.minimize();
        }
    }

    public minimize() {
        this.references.body.style.display = 'none';
        this.references.iconMinimize.style.display = 'none';
        this.references.iconMaximize.style.display = 'block';
        this.isMinimized = true;
    }

    public maximize() {
        this.references.body.style.display = 'block';
        this.references.iconMinimize.style.display = 'block';
        this.references.iconMaximize.style.display = 'none';
        this.isMinimized = false;
    }

    public showMessage(message: string) {
        this.addOutput(message);
    }

    public clear() {
        this.references.output.innerHTML = '';
    }

    private injectCss(): void {
        const css = '__css__';
        const style = document.createElement('style');
        style.textContent = css;
        document.head.appendChild(style);
    }

    private parseTemplate(template: string): HTMLElement {
        const parser = new DOMParser();
        const parsed = parser.parseFromString(template, 'text/html');
        return parsed.querySelector<HTMLElement>('.consola-window')!;
    }

    private parseReferences(element: Element): References {
        const references: References = {};
        traverseDOM(element, (el: HTMLElement) => {
            const ref = el.getAttribute('ref');
            if (ref) references[ref] = el;
        });
        return references;
    }

    private bindHandlers() {
        this.resizeHandler = this.resizeHandler.bind(this);
        this.inputKeydownHandler = this.inputKeydownHandler.bind(this);
        this.buttonResizeMouseDownHandler = this.buttonResizeMouseDownHandler.bind(this);
        this.windowMouseMoveHandler = this.windowMouseMoveHandler.bind(this);
        this.windowMouseUpHandler = this.windowMouseUpHandler.bind(this);
        this.buttonMinimizeClickHandler = this.buttonMinimizeClickHandler.bind(this);
        this.buttonCloseClickHandler = this.buttonCloseClickHandler.bind(this);
    }

    private setupEventListeners() {
        window.addEventListener('resize', this.resizeHandler);
        this.references.input.addEventListener('keydown', this.inputKeydownHandler);
        this.references.buttonResize.addEventListener('mousedown', this.buttonResizeMouseDownHandler);
        window.addEventListener('mousemove', this.windowMouseMoveHandler);
        window.addEventListener('mouseup', this.windowMouseUpHandler);
        this.references.buttonMinimize.addEventListener('click', this.buttonMinimizeClickHandler);
        this.references.buttonClose.addEventListener('click', this.buttonCloseClickHandler);
    }

    private addInput(value: string) {
        this.references.input.value = value;
    }

    private clearInput() {
        this.references.input.value = '';
        this.commandHistoryIndex = 0;
    }

    private parseInput(input: string): Input {
        const split = input.split(' ');
        const type = split[0];
        const valueAsString = split[1];
        const valueAsNumber = Number(valueAsString);
        const value = isNaN(valueAsNumber) ? valueAsString : valueAsNumber;
        return { type, value };
    }

    private executeCommand(input: Input): void {
        if (!Commands.execute(input.type, input.value)) {
            this.addOutput(`Unknown command "${input.type}"`);
        }
    }

    private showPreviousCommand(): void {
        const previous = Commands.history[Commands.history.length - (this.commandHistoryIndex + 1)];
        if (previous) {
            this.commandHistoryIndex += 1;
            this.addInput(previous);
        }
    }

    private showNextCommand(): void {
        const next = Commands.history[Commands.history.length - (this.commandHistoryIndex - 1)];
        if (next) {
            this.commandHistoryIndex -= 1;
            this.addInput(next);
        } else {
            this.clearInput();
        }
    }

    private addOutput(output: string, isCommand = false) {
        const item = document.createElement('li');
        let textContent = '';
        if (isCommand) textContent += '> ';
        textContent += output;
        item.innerHTML = textContent;
        this.references.output.appendChild(item);
        this.updateScrollPosition();
    }

    private resize() {
        if (!this.isCustomSize) {
            this.dimensions.width = window.innerWidth - MARGIN * 2;
            this.dimensions.height = window.innerHeight * 0.5;
        }
        this.window.style.top = `${MARGIN}px`;
        this.window.style.left = `${MARGIN}px`;
        this.updateWindowDimensions();
    }

    private updateScrollPosition() {
        this.references.output.scrollTop = this.references.output.scrollHeight;
    }

    private updateDimensions(x: number, y: number) {
        this.isCustomSize = true;

        const deltaX = this.buttonResizePosition.x - x;
        const deltaY = this.buttonResizePosition.y - y;

        this.buttonResizePosition.x = x;
        this.buttonResizePosition.y = y;

        this.dimensions.width -= deltaX;
        this.dimensions.height -= deltaY;
    }

    private updateWindowDimensions() {
        this.window.style.width = `${this.dimensions.width}px`;
        this.references.output.style.height = `${this.dimensions.height}px`;
    }

    private resizeHandler() {
        this.resize();
    }

    private inputKeydownHandler(event: KeyboardEvent) {
        switch (event.key) {
            case 'Enter':
                this.executeCommand(this.parseInput(this.references.input.value));
                this.clearInput();
                break;
            case 'ArrowUp':
                event.preventDefault();
                this.showPreviousCommand();
                break;
            case 'ArrowDown':
                event.preventDefault();
                this.showNextCommand();
                break;
        }
        if (event.key !== '`') event.stopPropagation();
    }

    private buttonResizeMouseDownHandler(event: MouseEvent) {
        this.buttonResizeIsMouseDown = true;
        this.buttonResizePosition.x = event.clientX;
        this.buttonResizePosition.y = event.clientY;
    }

    private windowMouseMoveHandler(event: MouseEvent) {
        if (this.buttonResizeIsMouseDown) {
            this.updateDimensions(event.clientX, event.clientY);
            this.updateWindowDimensions();
        }
    }

    private windowMouseUpHandler() {
        this.buttonResizeIsMouseDown = false;
    }

    private buttonMinimizeClickHandler() {
        this.toggleMinimize();
    }

    private buttonCloseClickHandler() {
        this.hide();
    }
}