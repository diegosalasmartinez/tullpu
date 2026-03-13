import { type Rectangle, type CanvasInstance, type Coords, ToolType, DEFAULT_STYLE } from '$lib/types';
import {
	SELECTION_COLOR,
	SELECTION_HANDLE_RADIUS,
	SELECTION_HANDLE_STROKE_WIDTH
} from '$lib/constants';

export type RectNode = { id: 'tl' | 'tr' | 'br' | 'bl'; x: number; y: number };

export default class RectangleEntity {
	private canvasStatic: CanvasInstance;
	private canvasInteractive: CanvasInstance;

	constructor(canvasStatic: CanvasInstance, canvasInteractive: CanvasInstance) {
		this.canvasStatic = canvasStatic;
		this.canvasInteractive = canvasInteractive;
	}

	drawCoords(coordsStart: Coords, coordsEnd: Coords) {
		const x = Math.min(coordsStart.x, coordsEnd.x);
		const y = Math.min(coordsStart.y, coordsEnd.y);
		const width = Math.abs(coordsEnd.x - coordsStart.x);
		const height = Math.abs(coordsEnd.y - coordsStart.y);
		this.draw(x, y, width, height, '#000000', 1, null, this.canvasInteractive.context);
	}

	drawShape(shape: Rectangle) {
		this.draw(
			shape.x,
			shape.y,
			shape.width,
			shape.height,
			shape.style.stroke,
			shape.style.strokeWidth,
			shape.style.fill,
			this.canvasStatic.context
		);
	}

	private draw(
		x: number,
		y: number,
		width: number,
		height: number,
		stroke: string,
		lineWidth: number,
		fill: string | null,
		ctx: CanvasRenderingContext2D
	) {
		ctx.strokeStyle = stroke;
		ctx.lineWidth = lineWidth;
		if (fill) {
			ctx.fillStyle = fill;
			ctx.fillRect(x, y, width, height);
		}
		ctx.strokeRect(x, y, width, height);
	}

	createShape(coordsStart: Coords, coordsEnd: Coords): Rectangle {
		const x = Math.min(coordsStart.x, coordsEnd.x);
		const y = Math.min(coordsStart.y, coordsEnd.y);
		const width = Math.abs(coordsEnd.x - coordsStart.x);
		const height = Math.abs(coordsEnd.y - coordsStart.y);

		return {
			id: crypto.randomUUID(),
			type: ToolType.RECTANGLE,
			style: { ...DEFAULT_STYLE },
			x,
			y,
			width,
			height
		};
	}

	getNodes(shape: Rectangle): RectNode[] {
		return [
			{ id: 'tl', x: shape.x, y: shape.y },
			{ id: 'tr', x: shape.x + shape.width, y: shape.y },
			{ id: 'br', x: shape.x + shape.width, y: shape.y + shape.height },
			{ id: 'bl', x: shape.x, y: shape.y + shape.height }
		];
	}

	updateFromNode(shape: Rectangle, nodeId: string, x: number, y: number) {
		// Capture all corners upfront before any mutation
		const tlX = shape.x;
		const tlY = shape.y;
		const brX = shape.x + shape.width;
		const brY = shape.y + shape.height;
		const trX = shape.x + shape.width;
		const trY = shape.y;
		const blX = shape.x;
		const blY = shape.y + shape.height;

		switch (nodeId) {
			case 'tl':
				shape.x = Math.min(x, brX);
				shape.y = Math.min(y, brY);
				shape.width = Math.abs(x - brX);
				shape.height = Math.abs(y - brY);
				break;
			case 'tr':
				shape.x = Math.min(blX, x);
				shape.y = Math.min(y, blY);
				shape.width = Math.abs(x - blX);
				shape.height = Math.abs(blY - y);
				break;
			case 'br':
				shape.x = Math.min(tlX, x);
				shape.y = Math.min(tlY, y);
				shape.width = Math.abs(x - tlX);
				shape.height = Math.abs(y - tlY);
				break;
			case 'bl':
				shape.x = Math.min(x, trX);
				shape.y = Math.min(trY, y);
				shape.width = Math.abs(trX - x);
				shape.height = Math.abs(y - trY);
				break;
		}
	}

	isClicked(shape: Rectangle, x: number, y: number): boolean {
		return (
			x >= shape.x &&
			x <= shape.x + shape.width &&
			y >= shape.y &&
			y <= shape.y + shape.height
		);
	}

	select(shape: Rectangle) {
		const ctx = this.canvasInteractive.context;

		// Dashed selection outline
		ctx.strokeStyle = SELECTION_COLOR;
		ctx.lineWidth = 1;
		ctx.setLineDash([4, 3]);
		ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
		ctx.setLineDash([]);

		// Handles
		for (const node of this.getNodes(shape)) {
			ctx.beginPath();
			ctx.arc(node.x, node.y, SELECTION_HANDLE_RADIUS, 0, Math.PI * 2);
			ctx.fillStyle = '#ffffff';
			ctx.fill();
			ctx.strokeStyle = SELECTION_COLOR;
			ctx.lineWidth = SELECTION_HANDLE_STROKE_WIDTH;
			ctx.stroke();
			ctx.closePath();
		}
	}
}
