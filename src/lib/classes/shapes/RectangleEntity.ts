import { ShapeType, type Rectangle } from '$lib/types';

export default class RectangleEntity {
	private ctxStatic: CanvasRenderingContext2D | null;
	private ctxInteractive: CanvasRenderingContext2D | null;

	constructor(
		ctxStatic: CanvasRenderingContext2D | null,
		ctxInteractive: CanvasRenderingContext2D | null
	) {
		this.ctxStatic = ctxStatic;
		this.ctxInteractive = ctxInteractive;
	}

	drawCoords(x1: number, y1: number, x2: number, y2: number) {
		this.draw(x1, y1, x2 - x1, y2 - y1, this.ctxInteractive);
	}

	drawShape(shape: Rectangle) {
		this.draw(shape.x, shape.y, shape.width, shape.height, this.ctxStatic);
	}

	private draw(
		x: number,
		y: number,
		width: number,
		height: number,
		ctx: CanvasRenderingContext2D | null
	) {
		if (!ctx) return;

		ctx.strokeStyle = 'green';
		ctx.strokeRect(x, y, width, height);
	}

	createShape(x1: number, y1: number, x2: number, y2: number) {
		const line: Rectangle = {
			id: crypto.randomUUID(),
			type: ShapeType.Rectangle,
			x: x1,
			y: y1,
			width: x2 - x1,
			height: y2 - y1
		};

		return line;
	}
}
