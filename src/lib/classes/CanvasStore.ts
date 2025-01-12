import { ToolType, type Shape, type Coords } from '$lib/types';
import { currentTool } from '$lib/stores/ToolStore';
import { currentShape } from '$lib/stores/ShapeStore';
import { currentOffset, currentStartPosition } from '$lib/stores/CoordsStore';

export default class CanvasStore {
	private shapes: Shape[] = [];

	private tool: ToolType = ToolType.SELECTION;
	private shape: Shape | null = null;
	private offset: Coords = { x: 0, y: 0 };
	private startPosition: Coords = { x: 0, y: 0 };

	constructor() {
		this.loadShapes();

		// Subscribe to stores
		currentTool.subscribe((tool) => {
			this.tool = tool;
		});
		currentShape.subscribe((shape) => {
			this.shape = shape;
		});
		currentOffset.subscribe((offset) => {
			this.offset = offset;
		});
		currentStartPosition.subscribe((position) => {
			this.startPosition = position;
		});
	}

	private loadShapes() {
		const shapesString = this.loadFromLocalStorage('shapes');
		if (shapesString) {
			this.shapes = JSON.parse(shapesString);
		}
	}

	getShapes() {
		return this.shapes;
	}

	addShape(shape: Shape) {
		this.shapes.push(shape);
		this.saveToLocalStorage('shapes', JSON.stringify(this.shapes));
	}

	removeShape(shape: Shape) {
		this.shapes = this.shapes.filter((s) => s.id !== shape.id);
		this.saveToLocalStorage('shapes', JSON.stringify(this.shapes));
	}

	getCurrentTool() {
		return this.tool;
	}

	setCurrentTool(tool: ToolType) {
		currentTool.set(tool);
	}

	getCurrentShape() {
        if (!this.shape) return null;

        // Prevent direct access to the shape object
		const shapeCopy: Shape = { ...this.shape };
        return shapeCopy
	}

	setCurrentShape(shape: Shape | null) {
		currentShape.set(shape);
	}

	getOffset() {
		return this.offset;
	}

	setOffset(offset: Coords) {
		currentOffset.set(offset);
	}

	getStartPosition() {
		return this.startPosition;
	}

	setStartPosition(position: Coords) {
		currentStartPosition.set(position);
	}

	private saveToLocalStorage(key: string, value: string) {
		localStorage.setItem(key, value);
	}

	private loadFromLocalStorage(key: string) {
		return localStorage.getItem(key);
	}
}
