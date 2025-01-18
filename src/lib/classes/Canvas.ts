import { ToolType, ActionType, type CanvasInstance } from '$lib/types';
import CanvasStore from './CanvasStore';
import CanvasDrawer from './CanvasDrawer';

export default class Canvas {
	private canvasStatic: CanvasInstance;
	private canvasInteractive: CanvasInstance;

	private canvasStore: CanvasStore;
	private canvasDrawer: CanvasDrawer;

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
		this.canvasInteractive.html.addEventListener('wheel', this.wheelListener, { passive: false });
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
		const callback = () => {
			const coords = this.canvasDrawer.getMousePosition(event);
			this.canvasStore.startPosition = coords;

			const entity = this.canvasDrawer.detectEntity(event);
			if (entity) {
				this.canvasStore.action = ActionType.EDIT;
				this.canvasDrawer.startEditing(entity.shape, entity.node);
				return;
			}

			if (this.canvasStore.tool === ToolType.SELECTION) {
				this.canvasStore.action = ActionType.SELECTION;
				this.canvasDrawer.startSelecting();
				return;
			}

			this.canvasStore.action = ActionType.DRAW;
			this.canvasDrawer.startDrawing();
		};

		callback();
		console.log('[mouse_down] action:', this.canvasStore.action);
	}

	private handleMouseMove(event: MouseEvent) {
		const callback = () => {
			this.canvasDrawer.detectHoverInteractiveElements(event);

			if (this.canvasStore.action === ActionType.EDIT) {
				this.canvasDrawer.editing(event);
				return;
			}

			if (this.canvasStore.action === ActionType.SELECTION) {
				// TODO: Implement selection
				return;
			}

			if (this.canvasStore.action === ActionType.DRAW) {
				this.canvasDrawer.drawing(event);
				return;
			}
		};

		callback();
		console.log('[mouse_move] action:', this.canvasStore.action);
	}

	private handleMouseUp(event: MouseEvent) {
		const callback = () => {
			if (this.canvasStore.action === ActionType.EDIT) {
				this.canvasDrawer.stopEditing(event);
			}

			if (this.canvasStore.action === ActionType.DRAW) {
				this.canvasDrawer.stopDrawing(event);
			}

			this.canvasStore.action = ActionType.IDLE;
			this.canvasStore.tool = ToolType.SELECTION;
		};

		callback();
		console.log('[mouse_up] action:', this.canvasStore.action);
	}

	private handleClick(event: MouseEvent) {
		const callback = () => {
			if (this.canvasStore.tool !== ToolType.SELECTION) return;

			this.canvasDrawer.click(event);
		};

        callback();
		console.log('[mouse_click] click:', this.canvasStore.tool);
	}

	private handleWheel(event: WheelEvent) {
		event.preventDefault();

		const { x: offsetX, y: offsetY } = this.canvasStore.offset;
		this.canvasStore.offset = { x: offsetX - event.deltaX, y: offsetY - event.deltaY };

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
