import { type Rectangle, type CanvasInstance, type Coords, ToolType } from '$lib/types';

export default class RectangleEntity {
	private canvasStatic: CanvasInstance;
	private canvasInteractive: CanvasInstance;

	constructor(canvasStatic: CanvasInstance, canvasInteractive: CanvasInstance) {
		this.canvasStatic = canvasStatic;
		this.canvasInteractive = canvasInteractive;
	}

	drawCoords(coordsStart: Coords, coordsEnd: Coords) {
		this.draw(
			coordsStart,
			coordsEnd.x - coordsStart.x,
			coordsEnd.y - coordsStart.y,
			this.canvasInteractive.context
		);
	}

	drawShape(shape: Rectangle) {
		this.draw(shape.coords, shape.width, shape.height, this.canvasStatic.context);
	}

	private draw(coords: Coords, width: number, height: number, ctx: CanvasRenderingContext2D) {
		ctx.strokeStyle = 'black';
		ctx.strokeRect(coords.x, coords.y, width, height);
	}

	createShape(coordsStart: Coords, coordsEnd: Coords) {
		const shape: Rectangle = {
			id: crypto.randomUUID(),
			type: ToolType.RECTANGLE,
			coords: coordsStart,
			width: coordsEnd.x - coordsStart.x,
			height: coordsEnd.y - coordsStart.y,
			nodes: []
		};

		return shape;
	}

	isClicked(shape: Rectangle, x: number, y: number) {}
}
