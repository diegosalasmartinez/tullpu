import type { Shape } from '$lib/types';

export default class CanvasStore {
	private shapes: Shape[] = [];

	constructor() {
		this.loadShapes();
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

	private saveToLocalStorage(key: string, value: string) {
		localStorage.setItem(key, value);
	}

	private loadFromLocalStorage(key: string) {
		return localStorage.getItem(key);
	}
}
