import { type Shape, type ToolBarOptions, ShapeType } from '../types';
import Store from './Store';
import { tool as toolStore } from '$lib/stores/ToolStore';
//import { createTool } from '$lib/runes/Tool.svelte';

export default class Canvas {
	private canvas: HTMLCanvasElement;
	private ctx: CanvasRenderingContext2D | null;
	private offsetX = 0;
	private offsetY = 0;

	private drawing = false;
	private startX = 0;
	private startY = 0;
	private currentTool: ToolBarOptions = 'selection';

	private store: Store;

	// Listener references
	private resizeListener: () => void;
	private wheelListener: (event: WheelEvent) => void;
	private mouseDownListener: (event: MouseEvent) => void;
	private mouseMoveListener: (event: MouseEvent) => void;
	private mouseUpListener: (event: MouseEvent) => void;

	constructor(canvas: HTMLCanvasElement) {
		this.canvas = canvas;
		this.ctx = canvas.getContext('2d');
		this.store = new Store();

		// Subscribe to stores
		toolStore.subscribe((value) => {
			this.currentTool = value;
		});

		// Save listener references
		this.resizeListener = this.resizeCanvas.bind(this);
		this.wheelListener = this.handleWheel.bind(this);
		this.mouseDownListener = this.handleMouseDown.bind(this);
		this.mouseMoveListener = this.handleMouseMove.bind(this);
		this.mouseUpListener = this.handleMouseUp.bind(this);

		this.initEventListeners();
	}

	private initEventListeners() {
		window.addEventListener('resize', this.resizeListener);
		this.canvas.addEventListener('wheel', this.wheelListener);
		this.canvas.addEventListener('mousedown', this.mouseDownListener);
		this.canvas.addEventListener('mousemove', this.mouseMoveListener);
		this.canvas.addEventListener('mouseup', this.mouseUpListener);
	}

	destroy() {
		window.removeEventListener('resize', this.resizeListener);
		this.canvas.removeEventListener('wheel', this.wheelListener);
		this.canvas.removeEventListener('mousedown', this.mouseDownListener);
		this.canvas.removeEventListener('mousemove', this.mouseMoveListener);
		this.canvas.removeEventListener('mouseup', this.mouseUpListener);
	}

	handleMouseDown(event: MouseEvent) {
		this.drawing = true;

		const currentPosition = this.getMousePosition(event);
		this.startX = currentPosition.x;
		this.startY = currentPosition.y;
	}

	handleMouseMove(event: MouseEvent) {
		if (!this.drawing || !this.ctx) return;

		const { x: currentX, y: currentY } = this.getMousePosition(event);

		this.draw();
		this.ctx.save();
		this.ctx.translate(this.offsetX, this.offsetY);

		if (this.currentTool === 'line') {
			this.drawLine(this.startX, this.startY, currentX, currentY);
		} else if (this.currentTool === 'rectangle') {
			this.drawRectangle(this.startX, this.startY, currentX - this.startX, currentY - this.startY);
		}

		this.ctx.restore();
	}

	handleMouseUp(event: MouseEvent) {
		if (!this.drawing) return;

		const { x: endX, y: endY } = this.getMousePosition(event);

		if (this.startX === endX && this.startY === endY) {
			this.drawing = false;
			return;
		}

		let shape: Shape | null = null;

		switch (this.currentTool) {
			case ShapeType.Line:
				shape = {
					id: crypto.randomUUID(),
					type: ShapeType.Line,
					x1: this.startX,
					y1: this.startY,
					x2: endX,
					y2: endY
				};
				break;
			case ShapeType.Rectangle:
				shape = {
					id: crypto.randomUUID(),
					type: ShapeType.Rectangle,
					x: this.startX,
					y: this.startY,
					width: endX - this.startX,
					height: endY - this.startY
				};
				break;
			default:
				break;
		}

		if (shape) this.store.addShape(shape);

		this.drawing = false;
	}

	handleWheel(event: WheelEvent) {
		event.preventDefault();

		this.offsetX -= event.deltaX;
		this.offsetY -= event.deltaY;

		this.draw();
	}

	resizeCanvas() {
		if (!this.ctx) return;

		const { innerWidth, innerHeight, devicePixelRatio } = window;

		this.canvas.width = innerWidth * devicePixelRatio;
		this.canvas.height = innerHeight * devicePixelRatio;

		this.canvas.style.width = `${innerWidth}px`;
		this.canvas.style.height = `${innerHeight}px`;

		this.ctx.scale(devicePixelRatio, devicePixelRatio);

		this.draw();
	}

	draw() {
		if (!this.ctx) return;

		// Config scale for high resolution
		const scaleFactor = window.devicePixelRatio || 1;
		this.canvas.width = this.canvas.clientWidth * scaleFactor;
		this.canvas.height = this.canvas.clientHeight * scaleFactor;
		this.ctx.scale(scaleFactor, scaleFactor);

		// Clear canvas
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

		// Apply translation
		this.ctx.save();
		this.ctx.translate(this.offsetX, this.offsetY);

		// Draw background
		this.ctx.fillStyle = '#f0f0f0';
		this.ctx.fillRect(-10000, -10000, 20000, 20000);

		for (const shape of this.store.getShapes()) {
			if (shape.type === 'line') {
				this.drawLine(shape.x1, shape.y1, shape.x2, shape.y2);
			} else if (shape.type === 'rectangle') {
				this.drawRectangle(shape.x, shape.y, shape.width, shape.height);
			}
		}

		this.ctx.restore();
	}

	private drawLine(x1: number, y1: number, x2: number, y2: number) {
		if (!this.ctx) return;

		this.ctx.strokeStyle = 'blue';
		this.ctx.lineWidth = 2;
		this.ctx.beginPath();
		this.ctx.moveTo(x1, y1);
		this.ctx.lineTo(x2, y2);
		this.ctx.stroke();
	}

	private drawRectangle(x: number, y: number, width: number, height: number) {
		if (!this.ctx) return;

		this.ctx.strokeStyle = 'green';
		this.ctx.strokeRect(x, y, width, height);
	}

	private getMousePosition(event: MouseEvent) {
		const canvasRect = this.canvas.getBoundingClientRect();
		const currentX = event.clientX - canvasRect.left - this.offsetX;
		const currentY = event.clientY - canvasRect.top - this.offsetY;

		return { x: currentX, y: currentY };
	}
}
