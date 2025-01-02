import { type Line, type CanvasInstance, type Node, type Coords, ToolType } from '$lib/types';

export default class LineEntity {
	private canvasStatic: CanvasInstance;
	private canvasInteractive: CanvasInstance;

	constructor(canvasStatic: CanvasInstance, canvasInteractive: CanvasInstance) {
		this.canvasStatic = canvasStatic;
		this.canvasInteractive = canvasInteractive;
	}

	drawCoords(coordsStart: Coords, coordsEnd: Coords) {
		this.draw(coordsStart, coordsEnd, this.canvasInteractive.context);
	}

	drawShape(shape: Line) {
		this.draw(shape.coordsStart, shape.coordsEnd, this.canvasStatic.context);
	}

	private draw(coordsStart: Coords, coordsEnd: Coords, ctx: CanvasRenderingContext2D) {
		const { x: x1, y: y1 } = coordsStart;
		const { x: x2, y: y2 } = coordsEnd;

		ctx.strokeStyle = 'black';
		ctx.lineWidth = 1;
		ctx.beginPath();
		ctx.moveTo(x1, y1);
		ctx.lineTo(x2, y2);
		ctx.stroke();
	}

	createShape(coordsStart: Coords, coordsEnd: Coords) {
		const shape: Line = {
			id: crypto.randomUUID(),
			type: ToolType.LINE,
			coordsStart,
			coordsEnd,
			nodes: this.createNodes(coordsStart, coordsEnd)
		};

		return shape;
	}

	private createNodes(coordsStart: Coords, coordsEnd: Coords) {
		const startNode: Node = {
			id: crypto.randomUUID(),
			x: coordsStart.x,
			y: coordsStart.y
		};

		const endNode: Node = {
			id: crypto.randomUUID(),
			x: coordsEnd.x,
			y: coordsEnd.y
		};

		return [startNode, endNode];
	}

	isClicked(shape: Line, x: number, y: number) {
		const { x: x1, y: y1 } = shape.coordsStart;
		const { x: x2, y: y2 } = shape.coordsEnd;

		const minDistance = 7;

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

		if (distance > minDistance) {
			return false;
		}

		return true;
	}

	select(shape: Line) {
		this.canvasInteractive.context.fillStyle = 'purple';

		// Draw circle at the start and end of the line
		for (const node of shape.nodes) {
			this.canvasInteractive.context.beginPath();
			this.canvasInteractive.context.arc(node.x, node.y, 5, 0, Math.PI * 2);
			this.canvasInteractive.context.fill();
			this.canvasInteractive.context.closePath();
		}
	}
}
