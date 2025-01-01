import { type Line, type CanvasInstance, ToolType } from '$lib/types';

export default class LineEntity {
	private canvasStatic: CanvasInstance;
	private canvasInteractive: CanvasInstance;

	constructor(canvasStatic: CanvasInstance, canvasInteractive: CanvasInstance) {
		this.canvasStatic = canvasStatic;
		this.canvasInteractive = canvasInteractive;
	}

	drawCoords(x1: number, y1: number, x2: number, y2: number) {
		this.draw(x1, y1, x2, y2, this.canvasInteractive.context);
	}

	drawShape(shape: Line) {
		this.draw(shape.x1, shape.y1, shape.x2, shape.y2, this.canvasStatic.context);
	}

	private draw(x1: number, y1: number, x2: number, y2: number, ctx: CanvasRenderingContext2D) {
		ctx.strokeStyle = 'black';
		ctx.lineWidth = 1;
		ctx.beginPath();
		ctx.moveTo(x1, y1);
		ctx.lineTo(x2, y2);
		ctx.stroke();
	}

	createShape(x1: number, y1: number, x2: number, y2: number) {
		const line: Line = {
			id: crypto.randomUUID(),
			type: ToolType.LINE,
			x1,
			y1,
			x2,
			y2
		};

		return line;
	}

	isClicked(shape: Line, x: number, y: number) {
		const { x1, y1, x2, y2 } = shape;

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

		// Draw circle at the start of the line
		this.canvasInteractive.context.beginPath();
		this.canvasInteractive.context.arc(shape.x1, shape.y1, 5, 0, Math.PI * 2);
		this.canvasInteractive.context.fill();
		this.canvasInteractive.context.closePath();

		// Draw circle at the end of the line
		this.canvasInteractive.context.beginPath();
		this.canvasInteractive.context.arc(shape.x2, shape.y2, 5, 0, Math.PI * 2);
		this.canvasInteractive.context.fill();
		this.canvasInteractive.context.closePath();
	}
}
