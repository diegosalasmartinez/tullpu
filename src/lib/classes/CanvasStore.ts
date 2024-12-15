import { ToolType, type Shape } from '$lib/types';
import { currentTool as currentToolStore } from '$lib/stores/ToolStore';
import { currentShape as currentShapeStore } from '$lib/stores/ShapeStore';

export default class CanvasStore {
	private shapes: Shape[] = [];
	private currentTool: ToolType = ToolType.Selection;
	private currentShape: Shape | null = null;

	constructor() {
		this.loadShapes();

		// Subscribe to stores
		currentToolStore.subscribe((tool) => {
			this.currentTool = tool;
		});
		currentShapeStore.subscribe((shape) => {
			this.currentShape = shape;
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

	getCurrentTool() {
		return this.currentTool;
	}

	getCurrentShape() {
		return this.currentShape;
	}

	setCurrentShape(shape: Shape) {
		currentShapeStore.set(shape);
	}

	private saveToLocalStorage(key: string, value: string) {
		localStorage.setItem(key, value);
	}

	private loadFromLocalStorage(key: string) {
		return localStorage.getItem(key);
	}
}
