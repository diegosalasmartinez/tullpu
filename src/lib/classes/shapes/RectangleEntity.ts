import { type Rectangle, type CanvasInstance, ToolType } from '$lib/types';

export default class RectangleEntity {
	private canvasStatic: CanvasInstance;
	private canvasInteractive: CanvasInstance;

	constructor(canvasStatic: CanvasInstance, canvasInteractive: CanvasInstance) {
		this.canvasStatic = canvasStatic;
		this.canvasInteractive = canvasInteractive;
	}

	drawCoords(x1: number, y1: number, x2: number, y2: number) {
		this.draw(x1, y1, x2 - x1, y2 - y1, this.canvasInteractive.context);
	}

	drawShape(shape: Rectangle) {
		this.draw(shape.x, shape.y, shape.width, shape.height, this.canvasStatic.context);
	}

	private draw(x: number, y: number, width: number, height: number, ctx: CanvasRenderingContext2D) {
		ctx.strokeStyle = 'black';
		ctx.strokeRect(x, y, width, height);
	}

	createShape(x1: number, y1: number, x2: number, y2: number) {
		const line: Rectangle = {
			id: crypto.randomUUID(),
			type: ToolType.RECTANGLE,
			x: x1,
			y: y1,
			width: x2 - x1,
			height: y2 - y1
		};

		return line;
	}

	isClicked(shape: Rectangle, x: number, y: number) {}
}
