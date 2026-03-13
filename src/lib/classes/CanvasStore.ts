import { appState } from '$lib/state.svelte';
import { type Shape, type ToolType, type Coords, type Page } from '$lib/types';

export default class CanvasStore {
	constructor() {
		this.loadPages();
	}

	private loadPages() {
		const pagesString = this.loadFromLocalStorage('pages');
		const savedActivePageId = this.loadFromLocalStorage('activePageId');

		if (pagesString) {
			try {
				appState.pages = JSON.parse(pagesString);
			} catch {
				// fall through to default
			}
		}

		if (appState.pages.length === 0) {
			const id = crypto.randomUUID();
			appState.pages = [{ id, name: 'Page 1', shapes: [] }];
			appState.activePageId = id;
			return;
		}

		if (savedActivePageId && appState.pages.some((p) => p.id === savedActivePageId)) {
			appState.activePageId = savedActivePageId;
		} else {
			appState.activePageId = appState.pages[0].id;
		}
	}

	private getActivePage(): Page {
		const page = appState.pages.find((p) => p.id === appState.activePageId);
		return page ?? appState.pages[0];
	}

	getShapes() {
		return this.getActivePage().shapes;
	}

	addShape(shape: Shape) {
		this.getActivePage().shapes.push(shape);
		this.persist();
	}

	updateShape(shape: Shape) {
		const page = this.getActivePage();
		const index = page.shapes.findIndex((s) => s.id === shape.id);
		if (index === -1) return;
		page.shapes[index] = shape;
		this.persist();
	}

	removeShape(id: string) {
		const page = this.getActivePage();
		page.shapes = page.shapes.filter((s) => s.id !== id);
		this.persist();
	}

	getPages() {
		return appState.pages;
	}

	addPage(name?: string) {
		const id = crypto.randomUUID();
		const newPage: Page = {
			id,
			name: name ?? `Page ${appState.pages.length + 1}`,
			shapes: []
		};
		appState.pages.push(newPage);
		appState.activePageId = id;
		this.persist();
	}

	setActivePage(id: string) {
		if (appState.pages.some((p) => p.id === id)) {
			appState.activePageId = id;
			this.saveToLocalStorage('activePageId', id);
		}
	}

	private persist() {
		this.saveToLocalStorage('pages', JSON.stringify(appState.pages));
		this.saveToLocalStorage('activePageId', appState.activePageId);
	}

	getCurrentTool() {
		return appState.tool;
	}

	setCurrentTool(tool: ToolType) {
		appState.tool = tool;
	}

	getCurrentShape() {
		return appState.currentShape;
	}

	setCurrentShape(shape: Shape | null) {
		appState.currentShape = shape;
	}

	getOffset() {
		return appState.offset;
	}

	setOffset(offset: Coords) {
		appState.offset = offset;
	}

	getStartPosition() {
		return appState.startPosition;
	}

	setStartPosition(position: Coords) {
		appState.startPosition = position;
	}

	private saveToLocalStorage(key: string, value: string) {
		localStorage.setItem(key, value);
	}

	private loadFromLocalStorage(key: string) {
		return localStorage.getItem(key);
	}
}
