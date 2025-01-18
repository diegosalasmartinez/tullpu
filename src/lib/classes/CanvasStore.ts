import { ToolType, ActionType, type Shape, type Coords } from '$lib/types';
import { currentOffset, currentStartPosition } from '$lib/stores/CoordsStore';
import { currentTool, currentAction } from '$lib/stores/ToolStore';
import { currentShape } from '$lib/stores/ShapeStore';

export default class CanvasStore {
	private _shapes: Shape[] = [];

	private _action: ActionType = ActionType.IDLE;
	private _tool: ToolType = ToolType.SELECTION;
	private _shape: Shape | null = null;
	private _offset: Coords = { x: 0, y: 0 };
	private _startPosition: Coords = { x: 0, y: 0 };

	constructor() {
		this.loadShapes();

		// Subscribe to stores
		currentAction.subscribe((action) => {
			this._action = action;
		});
		currentTool.subscribe((tool) => {
			this._tool = tool;
		});
		currentShape.subscribe((shape) => {
			this._shape = shape;
		});
		currentOffset.subscribe((offset) => {
			this._offset = offset;
		});
		currentStartPosition.subscribe((position) => {
			this._startPosition = position;
		});
	}

	private loadShapes() {
		const shapesString = this.loadFromLocalStorage('_shapes');
		if (shapesString) {
			this._shapes = JSON.parse(shapesString);
		}
	}

	get shapes() {
		return this._shapes;
	}

	addShape(_shape: Shape) {
		this._shapes.push(_shape);
		this.saveToLocalStorage('_shapes', JSON.stringify(this._shapes));
	}

	removeShape(_shape: Shape) {
		this._shapes = this._shapes.filter((s) => s.id !== _shape.id);
		this.saveToLocalStorage('_shapes', JSON.stringify(this._shapes));
	}

	get action() {
		return this._action;
	}

	set action(_action: ActionType) {
		currentAction.set(_action);
	}

	get tool() {
		return this._tool;
	}

	set tool(_tool: ToolType) {
		currentTool.set(_tool);
	}

	get currentShape() {
		if (!this._shape) return null;

		// Prevent direct access to the _shape object
		const shapeCopy: Shape = { ...this._shape };
		return shapeCopy;
	}

	set currentShape(_shape: Shape | null) {
		currentShape.set(_shape);
	}

	get offset() {
		return this._offset;
	}

	set offset(_offset: Coords) {
		currentOffset.set(_offset);
	}

	get startPosition() {
		return this._startPosition;
	}

	set startPosition(position: Coords) {
		currentStartPosition.set(position);
	}

	private saveToLocalStorage(key: string, value: string) {
		localStorage.setItem(key, value);
	}

	private loadFromLocalStorage(key: string) {
		return localStorage.getItem(key);
	}
}
