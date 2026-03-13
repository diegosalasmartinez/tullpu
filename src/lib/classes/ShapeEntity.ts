import { type Shape, type CanvasInstance, type Coords, ToolType } from '$lib/types';
import { appState } from '$lib/state.svelte';
import { SELECTION_PROXIMITY_RADIUS } from '$lib/constants';
import LineEntity from '$lib/classes/shapes/LineEntity';
import RectangleEntity from '$lib/classes/shapes/RectangleEntity';
import CircleEntity from '$lib/classes/shapes/CircleEntity';

export type SelectedNode = { id: string; x: number; y: number };

export default class ShapeEntity {
	private lineEntity: LineEntity;
	private rectangleEntity: RectangleEntity;
	private circleEntity: CircleEntity;
	private proximityRadius: number = SELECTION_PROXIMITY_RADIUS;

	constructor(canvasStatic: CanvasInstance, canvasInteractive: CanvasInstance) {
		this.lineEntity = new LineEntity(canvasStatic, canvasInteractive);
		this.rectangleEntity = new RectangleEntity(canvasStatic, canvasInteractive);
		this.circleEntity = new CircleEntity(canvasStatic, canvasInteractive);
	}

	drawCoords(coordsStart: Coords, coordsEnd: Coords) {
		switch (appState.tool) {
			case ToolType.LINE:
				return this.lineEntity.drawCoords(coordsStart, coordsEnd);
			case ToolType.RECTANGLE:
				return this.rectangleEntity.drawCoords(coordsStart, coordsEnd);
			case ToolType.CIRCLE:
				return this.circleEntity.drawCoords(coordsStart, coordsEnd);
			default:
				return;
		}
	}

	drawShape(shape: Shape) {
		switch (shape.type) {
			case ToolType.LINE:
				return this.lineEntity.drawShape(shape);
			case ToolType.RECTANGLE:
				return this.rectangleEntity.drawShape(shape);
			case ToolType.CIRCLE:
				return this.circleEntity.drawShape(shape);
			default:
				return;
		}
	}

	createShape(coordsStart: Coords, coordsEnd: Coords): Shape | null {
		switch (appState.tool) {
			case ToolType.LINE:
				return this.lineEntity.createShape(coordsStart, coordsEnd);
			case ToolType.RECTANGLE:
				return this.rectangleEntity.createShape(coordsStart, coordsEnd);
			case ToolType.CIRCLE:
				return this.circleEntity.createShape(coordsStart, coordsEnd);
			default:
				break;
		}

		return null;
	}

	isShapeSelected(shape: Shape, x: number, y: number) {
		switch (shape.type) {
			case ToolType.LINE:
				return this.lineEntity.isClicked(shape, x, y);
			case ToolType.RECTANGLE:
				return this.rectangleEntity.isClicked(shape, x, y);
			case ToolType.CIRCLE:
				return this.circleEntity.isClicked(shape, x, y);
			default:
				return false;
		}
	}

	selectShape(shape: Shape) {
		switch (shape.type) {
			case ToolType.LINE:
				return this.lineEntity.select(shape);
			case ToolType.RECTANGLE:
				return this.rectangleEntity.select(shape);
			case ToolType.CIRCLE:
				return this.circleEntity.select(shape);
			default:
				return null;
		}
	}

	getNodeSelected(shape: Shape, x: number, y: number): SelectedNode | null {
		for (const node of this.getShapeNodes(shape)) {
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

	updateShapeFromNode(shape: Shape, nodeId: string, x: number, y: number) {
		switch (shape.type) {
			case ToolType.LINE:
				return this.lineEntity.updateFromNode(shape, nodeId, x, y);
			case ToolType.RECTANGLE:
				return this.rectangleEntity.updateFromNode(shape, nodeId, x, y);
			case ToolType.CIRCLE:
				return this.circleEntity.updateFromNode(shape, nodeId, x, y);
		}
	}

	private getShapeNodes(shape: Shape): SelectedNode[] {
		switch (shape.type) {
			case ToolType.LINE:
				return this.lineEntity.getNodes(shape);
			case ToolType.RECTANGLE:
				return this.rectangleEntity.getNodes(shape);
			case ToolType.CIRCLE:
				return this.circleEntity.getNodes(shape);
			default:
				return [];
		}
	}
}
