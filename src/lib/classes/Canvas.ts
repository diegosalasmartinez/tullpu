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

		this.initEventListeners();
	}

	private initEventListeners() {
		window.addEventListener('resize', this.resizeListener);
		this.canvasInteractive.html.addEventListener('wheel', this.wheelListener);
		this.canvasInteractive.html.addEventListener('mousedown', this.mouseDownListener);
		this.canvasInteractive.html.addEventListener('mousemove', this.mouseMoveListener);
		this.canvasInteractive.html.addEventListener('mouseup', this.mouseUpListener);
		this.canvasInteractive.html.addEventListener('click', this.clickListener);
	}

	destroy() {
		window.removeEventListener('resize', this.resizeListener);
		this.canvasInteractive.html.removeEventListener('wheel', this.wheelListener);
		this.canvasInteractive.html.removeEventListener('mousedown', this.mouseDownListener);
		this.canvasInteractive.html.removeEventListener('mousemove', this.mouseMoveListener);
		this.canvasInteractive.html.removeEventListener('mouseup', this.mouseUpListener);
		this.canvasInteractive.html.removeEventListener('click', this.clickListener);
	}

	private handleMouseDown(event: MouseEvent) {
		console.log('[mouse_down]');
		const coords = this.canvasDrawer.getMousePosition(event);
		this.canvasStore.setStartPosition(coords);

		const shapeSelected = this.canvasDrawer.hasSelectedShape(event);

		if (shapeSelected) {
			this.canvasDrawer.startEditing(event, shapeSelected);
			this.action = ActionType.EDIT;
		} else {
            this.canvasDrawer.startDrawing(event);
			this.action = ActionType.DRAW;
		}
	}

	private handleMouseMove(event: MouseEvent) {
		console.log('[mouse_move]');
        this.canvasDrawer.detectHoverInteractiveElements(event);

		if (this.action === ActionType.EDIT) {
			this.canvasDrawer.editing(event);
		} else if (this.action === ActionType.DRAW) {
			this.canvasDrawer.drawing(event);
		}
	}

	private handleMouseUp(event: MouseEvent) {
		console.log('[mouse_up] action:', this.action);
		if (this.action === ActionType.EDIT) {
			this.canvasDrawer.stopEditing(event);
		} else if (this.action === ActionType.DRAW) {
			this.canvasDrawer.stopDrawing(event);
		}

		this.action = ActionType.IDLE;
	}

	private handleClick(event: MouseEvent) {
		console.log('[mouse_click]');
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

	resizeCanvas() {
		// Config scale for high resolution
		const { innerWidth, innerHeight, devicePixelRatio } = window;

		const canvasWidth = innerWidth * devicePixelRatio;
		const canvasHeight = innerHeight * devicePixelRatio;
		const canvasStyleWidth = `${innerWidth}px`;
		const canvasStyleHeight = `${innerHeight}px`;

		this.canvasStatic.html.width = canvasWidth;
		this.canvasStatic.html.height = canvasHeight;
		this.canvasStatic.html.style.width = canvasStyleWidth;
		this.canvasStatic.html.style.height = canvasStyleHeight;
		this.canvasStatic.context.scale(devicePixelRatio, devicePixelRatio);

		this.canvasInteractive.html.width = canvasWidth;
		this.canvasInteractive.html.height = canvasHeight;
		this.canvasInteractive.html.style.width = canvasStyleWidth;
		this.canvasInteractive.html.style.height = canvasStyleHeight;
		this.canvasInteractive.context.scale(devicePixelRatio, devicePixelRatio);

		this.canvasDrawer.drawCanvasStatic();
		this.canvasDrawer.drawCanvasInteractive();
	}
}
