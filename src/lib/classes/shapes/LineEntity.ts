import {
	type Line,
	type CanvasInstance,
	type Node,
	type Coords,
	CanvasType,
	ToolType
} from '$lib/types';
import { isBetween, minDistance } from '$lib/utils/selection';

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

	drawShape(shape: Line, canvasType?: CanvasType) {
		const ctx =
			!canvasType || canvasType === CanvasType.STATIC
				? this.canvasStatic.context
				: this.canvasInteractive.context;

		this.draw(shape.coordsStart, shape.coordsEnd, ctx);
	}

	private draw(coordsStart: Coords, coordsEnd: Coords, ctx: CanvasRenderingContext2D) {
		const { x: x1, y: y1 } = coordsStart;
		const { x: x2, y: y2 } = coordsEnd;

		ctx.strokeStyle = 'black';
		ctx.lineWidth = 2;
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

	isShapeDetected(shape: Line, coords: Coords) {
		const { x, y } = coords;

		const { x: x1, y: y1 } = shape.coordsStart;
		const { x: x2, y: y2 } = shape.coordsEnd;

		const isWithinX = isBetween(x, x1, x2);
		const isWithinY = isBetween(y, y1, y2);

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
		const coords = shape.nodes.map((node) => ({ x: node.x, y: node.y }));
		const ctx = this.canvasInteractive.context;

		ctx.fillStyle = 'white';
		ctx.strokeStyle = '#7dd3fc';
		ctx.lineWidth = 2;

		for (const coord of coords) {
			ctx.beginPath();
			ctx.arc(coord.x, coord.y, 5, 0, Math.PI * 2);
			ctx.fill();
			ctx.stroke();
			ctx.closePath();
		}
	}

	updateShape(shape: Line, coordsStart: Coords, coordsEnd: Coords, node: Node | null) {
		if (!node) {
			// Move the entire shape
			const dx = coordsEnd.x - coordsStart.x;
			const dy = coordsEnd.y - coordsStart.y;

			const start = { x: shape.coordsStart.x + dx, y: shape.coordsStart.y + dy };
			const end = { x: shape.coordsEnd.x + dx, y: shape.coordsEnd.y + dy };

			return this.updateCoords(shape, start, end);
		}

		// We need to update the node that was clicked
		// And use the other node as the start node
		const startNode = shape.nodes.filter((n) => n.id !== node.id)[0];
		if (!startNode) return shape;

		const start = { x: startNode.x, y: startNode.y };
		const end = coordsEnd;

		return this.updateCoords(shape, start, end);
	}

	updateCoords(shape: Line, coordsStart: Coords, coordsEnd: Coords) {
		shape.coordsStart = coordsStart;
		shape.coordsEnd = coordsEnd;
		shape.nodes = this.createNodes(coordsStart, coordsEnd);

		return shape;
	}

	getCursorStyleOnHover(shape: Line, coords: Coords, node: Node | null) {
        // TODO: Implement this
        if (node) {
            return 'pointer';
        }

		return 'move';
	}
}
