import { type Rectangle, type CanvasInstance, type Coords, type Node, ToolType } from '$lib/types';
import { isBetween } from '$lib/utils/selection';

export default class RectangleEntity {
	private canvasStatic: CanvasInstance;
	private canvasInteractive: CanvasInstance;
	private paddingX = 5;
	private paddingY = 5;

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
		ctx.lineWidth = 2;
		ctx.strokeRect(coords.x, coords.y, width, height);
	}

	createShape(coordsStart: Coords, coordsEnd: Coords) {
		const width = coordsEnd.x - coordsStart.x;
		const height = coordsEnd.y - coordsStart.y;

		const shape: Rectangle = {
			id: crypto.randomUUID(),
			type: ToolType.RECTANGLE,
			coords: coordsStart,
			width: width,
			height: height,
			nodes: this.createNodes(coordsStart, width, height)
		};

		return shape;
	}

	private createNodes(coords: Coords, width: number, height: number) {
		const node1: Node = {
			id: crypto.randomUUID(),
			x: coords.x + (width > 0 ? -this.paddingX : this.paddingX),
			y: coords.y + (height > 0 ? -this.paddingY : this.paddingY)
		};

		const node2: Node = {
			id: crypto.randomUUID(),
			x: coords.x + width + (width > 0 ? this.paddingX : -this.paddingX),
			y: coords.y + (height > 0 ? -this.paddingY : this.paddingY)
		};

		const node3: Node = {
			id: crypto.randomUUID(),
			x: coords.x + width + (width > 0 ? this.paddingX : -this.paddingX),
			y: coords.y + height + (height > 0 ? this.paddingY : -this.paddingY)
		};

		const node4: Node = {
			id: crypto.randomUUID(),
			x: coords.x + (width > 0 ? -this.paddingX : this.paddingX),
			y: coords.y + height + (height > 0 ? this.paddingY : -this.paddingY)
		};

		return [node1, node2, node3, node4];
	}

	isClicked(shape: Rectangle, coords: Coords) {
		const { x, y } = coords;

		const node1 = shape.nodes[0];
		const node2 = shape.nodes[1];
		const node3 = shape.nodes[2];
		const node4 = shape.nodes[3];

		const isTopLine = isBetween(x, node1.x, node2.x) && isBetween(y, node1.y);
		if (isTopLine) return true;

		const isRightLine = isBetween(x, node2.x) && isBetween(y, node2.y, node3.y);
		if (isRightLine) return true;

		const isBottomLine = isBetween(x, node4.x, node3.x) && isBetween(y, node4.y);
		if (isBottomLine) return true;

		const isLeftLine = isBetween(x, node1.x) && isBetween(y, node1.y, node4.y);
		if (isLeftLine) return true;

		return false;
	}

	select(shape: Rectangle) {
		const coords = shape.nodes.map((node) => ({ x: node.x, y: node.y }));
		const ctx = this.canvasInteractive.context;

		const width = shape.width + (shape.width > 0 ? this.paddingX * 2 : -this.paddingX * 2);
		const height = shape.height + (shape.height > 0 ? this.paddingY * 2 : -this.paddingY * 2);

		ctx.strokeStyle = '#7dd3fc';
		ctx.lineWidth = 2;
		ctx.strokeRect(shape.nodes[0].x, shape.nodes[0].y, width, height);

		ctx.fillStyle = 'white';
		for (const coord of coords) {
			ctx.beginPath();
			ctx.arc(coord.x, coord.y, 5, 0, Math.PI * 2);
			ctx.fill();
			ctx.stroke();
			ctx.closePath();
		}
	}
}
