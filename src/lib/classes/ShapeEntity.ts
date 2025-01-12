import { get } from 'svelte/store';
import {
	type Shape,
	type Node,
	type CanvasInstance,
	type Coords,
	ToolType,
	CanvasType
} from '$lib/types';
import { currentTool } from '$lib/stores/ToolStore';
import RectangleEntity from '$lib/classes/shapes/RectangleEntity';
import LineEntity from '$lib/classes/shapes/LineEntity';

export default class ShapeEntity {
	private lineEntity: LineEntity;
	private rectangleEntity: RectangleEntity;
	private proximityRadius: number = 5;

	constructor(canvasStatic: CanvasInstance, canvasInteractive: CanvasInstance) {
		this.lineEntity = new LineEntity(canvasStatic, canvasInteractive);
		this.rectangleEntity = new RectangleEntity(canvasStatic, canvasInteractive);
	}

	drawCoords(coordsStart: Coords, coordsEnd: Coords) {
		switch (get(currentTool)) {
			case ToolType.LINE:
				return this.lineEntity.drawCoords(coordsStart, coordsEnd);
			case ToolType.RECTANGLE:
				return this.rectangleEntity.drawCoords(coordsStart, coordsEnd);
			default:
				return;
		}
	}

	drawShape(shape: Shape, canvasType?: CanvasType) {
		switch (shape.type) {
			case ToolType.LINE:
				return this.lineEntity.drawShape(shape, canvasType);
			case ToolType.RECTANGLE:
				return this.rectangleEntity.drawShape(shape);
			default:
				return;
		}
	}

	createShape(coordsStart: Coords, coordsEnd: Coords): Shape | null {
		switch (get(currentTool)) {
			case ToolType.LINE:
				return this.lineEntity.createShape(coordsStart, coordsEnd);
			case ToolType.RECTANGLE:
				return this.rectangleEntity.createShape(coordsStart, coordsEnd);
			default:
				break;
		}

		return null;
	}

	isShapeSelected(shape: Shape, coords: Coords) {
		switch (shape.type) {
			case ToolType.LINE:
				return this.lineEntity.isClicked(shape, coords);
			default:
				return false;
		}
	}

	selectShape(shape: Shape) {
		switch (shape.type) {
			case ToolType.LINE:
				return this.lineEntity.select(shape);
			default:
				return null;
		}
	}

	updateShape(shape: Shape, coordsStart: Coords, coordsEnd: Coords, node: Node | null) {
		switch (shape.type) {
			case ToolType.LINE:
				return this.lineEntity.updateShape(shape, coordsStart, coordsEnd, node);
			default:
				return null;
		}
	}

	getNodeSelected(shape: Shape, coords: Coords) {
		const { x, y } = coords;

		for (const node of shape.nodes) {
			if (
				x >= node.x - this.proximityRadius &&
				x <= node.x + this.proximityRadius &&
				y >= node.y - this.proximityRadius &&
				y <= node.y + this.proximityRadius
			) {
				return node;
			}
		}

		return null;
	}
}
