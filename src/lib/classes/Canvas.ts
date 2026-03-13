import { ToolType, ActionType, type CanvasInstance } from '$lib/types';
import CanvasStore from './CanvasStore';
import CanvasDrawer from './CanvasDrawer';

export default class Canvas {
	private canvasStatic: CanvasInstance;
	private canvasInteractive: CanvasInstance;

	private canvasStore: CanvasStore;
	private canvasDrawer: CanvasDrawer;

	private action: ActionType = ActionType.IDLE;

	// Listener references
	private resizeListener: () => void;
	private wheelListener: (event: WheelEvent) => void;
	private clickListener: (event: MouseEvent) => void;
	private mouseDownListener: (event: MouseEvent) => void;
	private mouseMoveListener: (event: MouseEvent) => void;
	private mouseUpListener: (event: MouseEvent) => void;
	private keyDownListener: (event: KeyboardEvent) => void;

	constructor(canvasStatic: HTMLCanvasElement, canvasInteractive: HTMLCanvasElement) {
		const canvasStaticCtx = canvasStatic.getContext('2d');
		if (!canvasStaticCtx) throw new Error('CanvasRenderingContext2D not found');
		this.canvasStatic = { html: canvasStatic, context: canvasStaticCtx };

		const canvasInteractiveCtx = canvasInteractive.getContext('2d');
		if (!canvasInteractiveCtx) throw new Error('CanvasRenderingContext2D not found');
		this.canvasInteractive = { html: canvasInteractive, context: canvasInteractiveCtx };

		this.canvasStore = new CanvasStore();
		this.canvasDrawer = new CanvasDrawer(
			this.canvasStatic,
			this.canvasInteractive,
			this.canvasStore
		);

		// Save listener references
		this.resizeListener = this.resizeCanvas.bind(this);
		this.wheelListener = this.handleWheel.bind(this);
		this.mouseDownListener = this.handleMouseDown.bind(this);
		this.mouseMoveListener = this.handleMouseMove.bind(this);
		this.mouseUpListener = this.handleMouseUp.bind(this);
		this.clickListener = this.handleClick.bind(this);
		this.keyDownListener = this.handleKeyDown.bind(this);

		this.initEventListeners();
	}

	private initEventListeners() {
		window.addEventListener('resize', this.resizeListener);
		window.addEventListener('keydown', this.keyDownListener);
		this.canvasInteractive.html.addEventListener('wheel', this.wheelListener);
		this.canvasInteractive.html.addEventListener('mousedown', this.mouseDownListener);
		this.canvasInteractive.html.addEventListener('mousemove', this.mouseMoveListener);
		this.canvasInteractive.html.addEventListener('mouseup', this.mouseUpListener);
		this.canvasInteractive.html.addEventListener('click', this.clickListener);
	}

	destroy() {
		window.removeEventListener('resize', this.resizeListener);
		window.removeEventListener('keydown', this.keyDownListener);
		this.canvasInteractive.html.removeEventListener('wheel', this.wheelListener);
		this.canvasInteractive.html.removeEventListener('mousedown', this.mouseDownListener);
		this.canvasInteractive.html.removeEventListener('mousemove', this.mouseMoveListener);
		this.canvasInteractive.html.removeEventListener('mouseup', this.mouseUpListener);
		this.canvasInteractive.html.removeEventListener('click', this.clickListener);
	}

	private handleMouseDown(event: MouseEvent) {
		const { x, y } = this.canvasDrawer.getMousePosition(event);
		this.canvasStore.setStartPosition({ x, y });

		// Only enter edit mode when the selection tool is active
		if (this.canvasStore.getCurrentTool() === ToolType.SELECTION) {
			const shapeSelected = this.canvasDrawer.hasSelectedShape(event);
			if (shapeSelected) {
				this.canvasDrawer.startEditing(event, shapeSelected);
				this.action = ActionType.EDIT;
				return;
			}
		}

		this.action = ActionType.DRAW;
	}

	private handleMouseMove(event: MouseEvent) {
		if (this.action === ActionType.EDIT) {
			this.canvasDrawer.editing(event);
		} else if (this.action === ActionType.DRAW) {
			this.canvasDrawer.drawing(event);
		} else {
			this.canvasDrawer.updateCursor(event);
		}
	}

	private handleMouseUp(event: MouseEvent) {
		if (this.action === ActionType.EDIT) {
			this.canvasDrawer.stopEditing();
		} else if (this.action === ActionType.DRAW) {
			this.canvasDrawer.stopDrawing(event);
		}

		this.action = ActionType.IDLE;
	}

	private handleKeyDown(event: KeyboardEvent) {
		if (event.key !== 'Delete' && event.key !== 'Backspace') return;
		if (this.canvasStore.getCurrentTool() !== ToolType.SELECTION) return;
		this.canvasDrawer.deleteSelectedShape();
	}

	private handleClick(event: MouseEvent) {
		if (this.canvasStore.getCurrentTool() !== ToolType.SELECTION) return;

		this.canvasDrawer.click(event);
	}

	private handleWheel(event: WheelEvent) {
		event.preventDefault();

		const { x: offsetX, y: offsetY } = this.canvasStore.getOffset();
		this.canvasStore.setOffset({ x: offsetX - event.deltaX, y: offsetY - event.deltaY });

		this.canvasDrawer.drawCanvasStatic();
		this.canvasDrawer.drawCanvasInteractive();
	}

	redrawAll() {
		this.canvasDrawer.drawCanvasStatic();
		this.canvasDrawer.drawCanvasInteractive();
	}

	cancelEditing() {
		this.canvasDrawer.cancelEditing();
		this.action = ActionType.IDLE;
	}

	resizeCanvas() {
		const { innerWidth, innerHeight, devicePixelRatio: dpr } = window;

		const canvasWidth = innerWidth * dpr;
		const canvasHeight = innerHeight * dpr;
		const canvasStyleWidth = `${innerWidth}px`;
		const canvasStyleHeight = `${innerHeight}px`;

		this.canvasStatic.html.width = canvasWidth;
		this.canvasStatic.html.height = canvasHeight;
		this.canvasStatic.html.style.width = canvasStyleWidth;
		this.canvasStatic.html.style.height = canvasStyleHeight;
		this.canvasStatic.context.setTransform(dpr, 0, 0, dpr, 0, 0);

		this.canvasInteractive.html.width = canvasWidth;
		this.canvasInteractive.html.height = canvasHeight;
		this.canvasInteractive.html.style.width = canvasStyleWidth;
		this.canvasInteractive.html.style.height = canvasStyleHeight;
		this.canvasInteractive.context.setTransform(dpr, 0, 0, dpr, 0, 0);

		this.canvasDrawer.drawCanvasStatic();
		this.canvasDrawer.drawCanvasInteractive();
	}
}
