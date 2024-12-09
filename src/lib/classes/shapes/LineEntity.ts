import { ShapeType, type Line } from '$lib/types';

export default class LineEntity {
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
		this.draw(x1, y1, x2, y2, this.ctxInteractive);
	}

	drawShape(shape: Line) {
		this.draw(shape.x1, shape.y1, shape.x2, shape.y2, this.ctxStatic);
	}

	private draw(
		x1: number,
		y1: number,
		x2: number,
		y2: number,
		ctx: CanvasRenderingContext2D | null
	) {
		if (!ctx) return;

		ctx.strokeStyle = 'black';
		ctx.lineWidth = 2;
		ctx.beginPath();
		ctx.moveTo(x1, y1);
		ctx.lineTo(x2, y2);
		ctx.stroke();
	}

	createShape(x1: number, y1: number, x2: number, y2: number) {
		const line: Line = {
			id: crypto.randomUUID(),
			type: ShapeType.Line,
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
		if (!this.ctxStatic) return;

		// TODO: Draw little white circle at the start and end of the line (interactive canvas)
		this.ctxStatic.fillStyle = 'white';
		this.ctxStatic.beginPath();
		this.ctxStatic.arc(shape.x1, shape.y1, 5, 0, Math.PI * 2);
		this.ctxStatic.fill();
		this.ctxStatic.closePath();

		this.ctxStatic.beginPath();
		this.ctxStatic.arc(shape.x2, shape.y2, 5, 0, Math.PI * 2);
		this.ctxStatic.fill();
		this.ctxStatic.closePath();
	}
}
