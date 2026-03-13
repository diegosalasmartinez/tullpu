import { type Line, type CanvasInstance, type Coords, ToolType, DEFAULT_STYLE } from '$lib/types';
import {
	SELECTION_COLOR,
	SELECTION_HANDLE_RADIUS,
	SELECTION_HANDLE_STROKE_WIDTH,
	LINE_HIT_DISTANCE
} from '$lib/constants';

export type LineNode = { id: 'start' | 'end'; x: number; y: number };

export default class LineEntity {
	private canvasStatic: CanvasInstance;
	private canvasInteractive: CanvasInstance;

	constructor(canvasStatic: CanvasInstance, canvasInteractive: CanvasInstance) {
		this.canvasStatic = canvasStatic;
		this.canvasInteractive = canvasInteractive;
	}

	drawCoords(coordsStart: Coords, coordsEnd: Coords) {
		this.draw(coordsStart, coordsEnd, '#000000', 1, this.canvasInteractive.context);
	}

	drawShape(shape: Line) {
		this.draw(
			shape.start,
			shape.end,
			shape.style.stroke,
			shape.style.strokeWidth,
			this.canvasStatic.context
		);
	}

	private draw(
		coordsStart: Coords,
		coordsEnd: Coords,
		stroke: string,
		lineWidth: number,
		ctx: CanvasRenderingContext2D
	) {
		const { x: x1, y: y1 } = coordsStart;
		const { x: x2, y: y2 } = coordsEnd;

		ctx.strokeStyle = stroke;
		ctx.lineWidth = lineWidth;
		ctx.beginPath();
		ctx.moveTo(x1, y1);
		ctx.lineTo(x2, y2);
		ctx.stroke();
	}

	createShape(coordsStart: Coords, coordsEnd: Coords): Line {
		return {
			id: crypto.randomUUID(),
			type: ToolType.LINE,
			style: { ...DEFAULT_STYLE },
			start: coordsStart,
			end: coordsEnd
		};
	}

	getNodes(shape: Line): LineNode[] {
		return [
			{ id: 'start', x: shape.start.x, y: shape.start.y },
			{ id: 'end', x: shape.end.x, y: shape.end.y }
		];
	}

	updateFromNode(shape: Line, nodeId: string, x: number, y: number) {
		if (nodeId === 'start') {
			shape.start = { x, y };
		} else {
			shape.end = { x, y };
		}
	}

	isClicked(shape: Line, x: number, y: number) {
		const { x: x1, y: y1 } = shape.start;
		const { x: x2, y: y2 } = shape.end;

		const minDistance = LINE_HIT_DISTANCE;

		const minX = Math.min(x1, x2);
		const maxX = Math.max(x1, x2);
		const minY = Math.min(y1, y2);
		const maxY = Math.max(y1, y2);

		const isWithinX = x >= minX - minDistance && x <= maxX + minDistance;
		const isWithinY = y >= minY - minDistance && y <= maxY + minDistance;

		if (!isWithinX || !isWithinY) {
			return false;
		}

		const dy = y2 - y1;
		const dx = x2 - x1;

		if (dx === 0) {
			return isWithinX;
		}

		if (dy === 0) {
			return isWithinY;
		}

		const numerator = Math.abs((y2 - y1) * x - (x2 - x1) * y + x2 * y1 - y2 * x1);
		const denominator = Math.sqrt(Math.pow(y2 - y1, 2) + Math.pow(x2 - x1, 2));
		const distance = numerator / denominator;

		return distance <= minDistance;
	}

	select(shape: Line) {
		const ctx = this.canvasInteractive.context;

		// Selection highlight along the line
		ctx.beginPath();
		ctx.moveTo(shape.start.x, shape.start.y);
		ctx.lineTo(shape.end.x, shape.end.y);
		ctx.strokeStyle = SELECTION_COLOR;
		ctx.lineWidth = 1;
		ctx.setLineDash([4, 3]);
		ctx.stroke();
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
