import { type Shape, ShapeType } from '../types';
import { currentTool } from '$lib/stores/ToolStore';
import { currentShape } from '$lib/stores/ShapeStore';
import LineEntity from '$lib/classes/shapes/LineEntity';
import RectangleEntity from '$lib/classes/shapes/RectangleEntity';
import { get } from 'svelte/store';

export default class ShapeEntity {
	private lineEntity: LineEntity;
	private rectangleEntity: RectangleEntity;

	constructor(
		ctxStatic: CanvasRenderingContext2D | null,
		ctxInteractive: CanvasRenderingContext2D | null
	) {
		this.lineEntity = new LineEntity(ctxStatic, ctxInteractive);
		this.rectangleEntity = new RectangleEntity(ctxStatic, ctxInteractive);
	}

	drawCoords(x1: number, y1: number, x2: number, y2: number) {
		switch (get(currentTool)) {
			case ShapeType.Line:
				return this.lineEntity.drawCoords(x1, y1, x2, y2);
			case ShapeType.Rectangle:
				return this.rectangleEntity.drawCoords(x1, y1, x2, y2);
			default:
				return;
		}
	}

	drawShape(shape: Shape) {
		switch (shape.type) {
			case ShapeType.Line:
				return this.lineEntity.drawShape(shape);
			case ShapeType.Rectangle:
				return this.rectangleEntity.drawShape(shape);
			default:
				return;
		}
	}

	createShape(x1: number, y1: number, x2: number, y2: number): Shape | null {
		switch (get(currentTool)) {
			case ShapeType.Line:
				return this.lineEntity.createShape(x1, y1, x2, y2);
			case ShapeType.Rectangle:
				return this.rectangleEntity.createShape(x1, y1, x2, y2);
			default:
				break;
		}

		return null;
	}

	isShapeSelected(shape: Shape, x: number, y: number) {
		switch (shape.type) {
			case ShapeType.Line:
				return this.lineEntity.isClicked(shape, x, y);
			//case ShapeType.Rectangle:
			//    return this.rectangleEntity.isClicked(shape, x, y);
			default:
				return false;
		}
	}

	selectShape(shape: Shape) {
		currentShape.set(shape);

		switch (shape.type) {
			case ShapeType.Line:
				return this.lineEntity.select(shape);
			//case ShapeType.Rectangle:
			//    return this.rectangleEntity.select(shape);
			default:
				return;
		}
	}
}
