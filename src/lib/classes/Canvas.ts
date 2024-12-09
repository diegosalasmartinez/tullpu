import type { Shape } from '$lib/types';
import ShapeEntity from './ShapeEntity';
import Store from './Store';

export default class Canvas {
	private canvasStatic: HTMLCanvasElement;
	private ctxStatic: CanvasRenderingContext2D | null;

	private canvasInteractive: HTMLCanvasElement;
	private ctxInteractive: CanvasRenderingContext2D | null;

	private offsetX = 0;
	private offsetY = 0;

	private drawing = false;
	private startX = 0;
	private startY = 0;

	private store: Store;
	private shapeEntity: ShapeEntity;

	// Listener references
	private resizeListener: () => void;
	private wheelListener: (event: WheelEvent) => void;
	private clickListener: (event: MouseEvent) => void;
	private mouseDownListener: (event: MouseEvent) => void;
	private mouseMoveListener: (event: MouseEvent) => void;
	private mouseUpListener: (event: MouseEvent) => void;

	constructor(canvasStatic: HTMLCanvasElement, canvasInteractive: HTMLCanvasElement) {
		this.canvasStatic = canvasStatic;
		this.ctxStatic = canvasStatic.getContext('2d');

		this.canvasInteractive = canvasInteractive;
		this.ctxInteractive = canvasInteractive.getContext('2d');

		this.store = new Store();
		this.shapeEntity = new ShapeEntity(this.ctxStatic, this.ctxInteractive);

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
		this.canvasInteractive.addEventListener('wheel', this.wheelListener);
		this.canvasInteractive.addEventListener('mousedown', this.mouseDownListener);
		this.canvasInteractive.addEventListener('mousemove', this.mouseMoveListener);
		this.canvasInteractive.addEventListener('mouseup', this.mouseUpListener);
		this.canvasInteractive.addEventListener('click', this.clickListener);
	}

	destroy() {
		window.removeEventListener('resize', this.resizeListener);
		this.canvasInteractive.removeEventListener('wheel', this.wheelListener);
		this.canvasInteractive.removeEventListener('mousedown', this.mouseDownListener);
		this.canvasInteractive.removeEventListener('mousemove', this.mouseMoveListener);
		this.canvasInteractive.removeEventListener('mouseup', this.mouseUpListener);
		this.canvasInteractive.removeEventListener('click', this.clickListener);
	}

	handleMouseDown(event: MouseEvent) {
		this.drawing = true;

		const { x, y } = this.getMousePosition(event);
		this.startX = x;
		this.startY = y;
	}

	handleMouseMove(event: MouseEvent) {
		if (!this.drawing || !this.ctxInteractive) return;

		const { x, y } = this.getMousePosition(event);

		this.clearInteractiveCanvas();

		// Apply translation
		this.ctxInteractive.save();
		this.ctxInteractive.translate(this.offsetX, this.offsetY);

		// Draw shape to interactive canvas
		this.shapeEntity.drawCoords(this.startX, this.startY, x, y);

		// Restore translation
		this.ctxInteractive.restore();
	}

	handleMouseUp(event: MouseEvent) {
		if (!this.drawing) return;

		const { x, y } = this.getMousePosition(event);

		// Validate it's not the same point
		if (this.startX === x && this.startY === y) {
			this.drawing = false;
			return;
		}

		const shape = this.shapeEntity.createShape(this.startX, this.startY, x, y);
		if (shape) this.addShapeToCanvas(shape);

		this.drawing = false;
	}

	private addShapeToCanvas(shape: Shape) {
		this.store.addShape(shape);

		this.clearInteractiveCanvas();

		if (!this.ctxStatic) return;

		// Apply translation
		this.ctxStatic.save();
		this.ctxStatic.translate(this.offsetX, this.offsetY);

		// Draw shape to static canvas
		this.shapeEntity.drawShape(shape);

		// Restore translation
		this.ctxStatic.restore();
	}

	// TODO: Implement method with interactive canvas
	handleClick(event: MouseEvent) {
		const { x, y } = this.getMousePosition(event);

		for (const shape of this.store.getShapes()) {
			const isSelected = this.shapeEntity.isShapeSelected(shape, x, y);
			if (isSelected) {
				this.shapeEntity.selectShape(shape);
				break;
			}
		}
	}

	handleWheel(event: WheelEvent) {
		event.preventDefault();

		this.offsetX -= event.deltaX;
		this.offsetY -= event.deltaY;

		this.draw();
	}

	resizeCanvas() {
		if (!this.ctxStatic || !this.ctxInteractive) return;

		// Config scale for high resolution
		const { innerWidth, innerHeight, devicePixelRatio } = window;

		this.canvasStatic.width = innerWidth * devicePixelRatio;
		this.canvasStatic.height = innerHeight * devicePixelRatio;
		this.canvasStatic.style.width = `${innerWidth}px`;
		this.canvasStatic.style.height = `${innerHeight}px`;
		this.ctxStatic.scale(devicePixelRatio, devicePixelRatio);

		this.canvasInteractive.width = innerWidth * devicePixelRatio;
		this.canvasInteractive.height = innerHeight * devicePixelRatio;
		this.canvasInteractive.style.width = `${innerWidth}px`;
		this.canvasInteractive.style.height = `${innerHeight}px`;
		this.ctxInteractive.scale(devicePixelRatio, devicePixelRatio);

		this.draw();
	}

	private draw() {
		if (!this.ctxStatic) return;

		this.clearStaticCanvas();

		// Apply translation
		this.ctxStatic.save();
		this.ctxStatic.translate(this.offsetX, this.offsetY);

		// Draw background
		this.ctxStatic.fillStyle = '#f0f0f0';
		this.ctxStatic.fillRect(-10000, -10000, 20000, 20000);

		for (const shape of this.store.getShapes()) {
			this.shapeEntity.drawShape(shape);
		}

		// Restore translation
		this.ctxStatic.restore();
	}

	private clearStaticCanvas() {
		if (!this.ctxStatic) return;

		this.ctxStatic.clearRect(0, 0, this.canvasStatic.width, this.canvasStatic.height);
	}

	private clearInteractiveCanvas() {
		if (!this.ctxInteractive) return;

		this.ctxInteractive.clearRect(
			0,
			0,
			this.canvasInteractive.width,
			this.canvasInteractive.height
		);
	}

	private getMousePosition(event: MouseEvent) {
		const canvasRect = this.canvasStatic.getBoundingClientRect();
		const currentX = event.clientX - canvasRect.left - this.offsetX;
		const currentY = event.clientY - canvasRect.top - this.offsetY;

		return { x: currentX, y: currentY };
	}
}
