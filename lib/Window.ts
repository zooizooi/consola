import EventDispatcher from './EventDispatcher';
import { traverseDOM } from './utils';

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

const MARGIN: number = 25;

interface References {
    [ref: string]: any
}

export default class Window extends EventDispatcher {
    private references: References;
    private window: HTMLElement;
    private isVisible = false;
    private dimensions: { width: number, height: number } = { width: 0, height: 0 };
    private buttonResizeIsMouseDown = false;
    private buttonResizePosition: { x: number, y: number } = { x: 0, y: 0 };
    private isCustomSize = false;
    private isMinimized = false;

    constructor() {
        super();
        this.window = this.parseTemplate(template);
        this.references = this.parseReferences(this.window);
        this.injectCss();
        this.bindHandlers();
        this.setupEventListeners();
        this.resize();
        document.body.appendChild(this.window);
    }

    public toggle() {
        this.isVisible ? this.hide() : this.show();
    }

    public show() {
        this.window.style.display = 'block';
        this.isVisible = true;
        this.references.input.focus();
    }

    public hide() {
        this.window.style.display = 'none';
        this.isVisible = false;
    }

    public toggleMinimize() {
        this.isMinimized ? this.maximize() : this.minimize();
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

    private clearInput() {
        this.references.input.value = '';
    }

    private executeCommand(command: string): void {
        this.addOutput(command, true);
        if (this.hasEvent(command)) {
            this.dispatchEvent(command);
        } else {
            this.addOutput(`Unknown command "${command}"`);
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
        if (event.key === 'Enter') {
            this.executeCommand(this.references.input.value);
            this.clearInput();
        }
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