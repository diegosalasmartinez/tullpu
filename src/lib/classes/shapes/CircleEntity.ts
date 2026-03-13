import { type Circle, type CanvasInstance, type Coords, ToolType, DEFAULT_STYLE } from '$lib/types';
import {
	SELECTION_COLOR,
	SELECTION_HANDLE_RADIUS,
	SELECTION_HANDLE_STROKE_WIDTH
} from '$lib/constants';

export type CircleNode = { id: 'top' | 'right' | 'bottom' | 'left'; x: number; y: number };

export default class CircleEntity {
	private canvasStatic: CanvasInstance;
	private canvasInteractive: CanvasInstance;

	constructor(canvasStatic: CanvasInstance, canvasInteractive: CanvasInstance) {
		this.canvasStatic = canvasStatic;
		this.canvasInteractive = canvasInteractive;
	}

	drawCoords(coordsStart: Coords, coordsEnd: Coords) {
		const { cx, cy, rx, ry } = this.boundsToEllipse(coordsStart, coordsEnd);
		this.draw(cx, cy, rx, ry, '#000000', 1, null, this.canvasInteractive.context);
	}

	drawShape(shape: Circle) {
		this.draw(
			shape.cx,
			shape.cy,
			shape.rx,
			shape.ry,
			shape.style.stroke,
			shape.style.strokeWidth,
			shape.style.fill,
			this.canvasStatic.context
		);
	}

	private draw(
		cx: number,
		cy: number,
		rx: number,
		ry: number,
		stroke: string,
		lineWidth: number,
		fill: string | null,
		ctx: CanvasRenderingContext2D
	) {
		if (rx === 0 || ry === 0) return;
		ctx.beginPath();
		ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
		ctx.strokeStyle = stroke;
		ctx.lineWidth = lineWidth;
		if (fill) {
			ctx.fillStyle = fill;
			ctx.fill();
		}
		ctx.stroke();
		ctx.closePath();
	}

	createShape(coordsStart: Coords, coordsEnd: Coords): Circle {
		const { cx, cy, rx, ry } = this.boundsToEllipse(coordsStart, coordsEnd);
		return {
			id: crypto.randomUUID(),
			type: ToolType.CIRCLE,
			style: { ...DEFAULT_STYLE },
			cx,
			cy,
			rx,
			ry
		};
	}

	getNodes(shape: Circle): CircleNode[] {
		return [
			{ id: 'top', x: shape.cx, y: shape.cy - shape.ry },
			{ id: 'right', x: shape.cx + shape.rx, y: shape.cy },
			{ id: 'bottom', x: shape.cx, y: shape.cy + shape.ry },
			{ id: 'left', x: shape.cx - shape.rx, y: shape.cy }
		];
	}

	updateFromNode(shape: Circle, nodeId: string, x: number, y: number) {
		switch (nodeId) {
			case 'right':
			case 'left':
				shape.rx = Math.max(1, Math.abs(x - shape.cx));
				break;
			case 'top':
			case 'bottom':
				shape.ry = Math.max(1, Math.abs(y - shape.cy));
				break;
		}
	}

	isClicked(shape: Circle, x: number, y: number): boolean {
		const dx = (x - shape.cx) / shape.rx;
		const dy = (y - shape.cy) / shape.ry;
		return dx * dx + dy * dy <= 1;
	}

	select(shape: Circle) {
		const ctx = this.canvasInteractive.context;

		// Dashed selection outline
		ctx.beginPath();
		ctx.ellipse(shape.cx, shape.cy, shape.rx, shape.ry, 0, 0, Math.PI * 2);
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

	private boundsToEllipse(start: Coords, end: Coords) {
		return {
			cx: (start.x + end.x) / 2,
			cy: (start.y + end.y) / 2,
			rx: Math.abs(end.x - start.x) / 2,
			ry: Math.abs(end.y - start.y) / 2
		};
	}
}
