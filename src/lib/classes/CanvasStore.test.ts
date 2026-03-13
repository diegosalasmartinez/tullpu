import { describe, it, expect, beforeEach } from 'vitest';
import CanvasStore from './CanvasStore';
import { ToolType, type Line, type Page } from '$lib/types';
import { appState } from '$lib/state.svelte';

const makeLine = (id = 'line-1'): Line => ({
	id,
	type: ToolType.LINE,
	style: { stroke: '#000000', strokeWidth: 1, fill: null },
	start: { x: 0, y: 0 },
	end: { x: 100, y: 100 }
});

const makeDefaultPages = (): Page[] => [
	{ id: 'page-1', name: 'Page 1', shapes: [] }
];

beforeEach(() => {
	localStorage.clear();
	appState.tool = ToolType.SELECTION;
	appState.currentShape = null;
	appState.offset = { x: 0, y: 0 };
	appState.startPosition = { x: 0, y: 0 };
	appState.pages = makeDefaultPages();
	appState.activePageId = 'page-1';
});

describe('CanvasStore', () => {
	describe('initialization', () => {
		it('starts with the default page when localStorage is empty', () => {
			const store = new CanvasStore();
			expect(store.getShapes()).toEqual([]);
			expect(store.getPages()).toHaveLength(1);
		});

		it('loads pages from localStorage on construction', () => {
			const pages: Page[] = [
				{ id: 'p-a', name: 'A', shapes: [makeLine('a')] },
				{ id: 'p-b', name: 'B', shapes: [] }
			];
			localStorage.setItem('pages', JSON.stringify(pages));
			localStorage.setItem('activePageId', 'p-a');

			const store = new CanvasStore();
			expect(store.getPages()).toHaveLength(2);
			expect(store.getShapes()).toHaveLength(1);
			expect(store.getShapes()[0].id).toBe('a');
		});

		it('recovers gracefully from corrupted localStorage data', () => {
			localStorage.setItem('pages', 'not valid json {{{');
			const store = new CanvasStore();
			expect(store.getShapes()).toEqual([]);
		});
	});

	describe('addShape', () => {
		it('adds a shape to the active page', () => {
			const store = new CanvasStore();
			store.addShape(makeLine());
			expect(store.getShapes()).toHaveLength(1);
		});

		it('persists pages to localStorage', () => {
			const store = new CanvasStore();
			store.addShape(makeLine('persisted'));
			const saved = JSON.parse(localStorage.getItem('pages')!) as Page[];
			expect(saved[0].shapes[0].id).toBe('persisted');
		});

		it('accumulates multiple shapes', () => {
			const store = new CanvasStore();
			store.addShape(makeLine('x'));
			store.addShape(makeLine('y'));
			expect(store.getShapes()).toHaveLength(2);
		});
	});

	describe('updateShape', () => {
		it('updates the matching shape in the active page', () => {
			const store = new CanvasStore();
			const line = makeLine('update-me');
			store.addShape(line);

			const updated: Line = { ...line, end: { x: 999, y: 999 } };
			store.updateShape(updated);

			const saved = store.getShapes()[0] as Line;
			expect(saved.end).toEqual({ x: 999, y: 999 });
		});

		it('persists the updated shape to localStorage', () => {
			const store = new CanvasStore();
			const line = makeLine('persist-update');
			store.addShape(line);

			store.updateShape({ ...line, end: { x: 42, y: 42 } });

			const saved = JSON.parse(localStorage.getItem('pages')!) as Page[];
			const updatedLine = saved[0].shapes[0] as Line;
			expect(updatedLine.end).toEqual({ x: 42, y: 42 });
		});

		it('does nothing when the shape id is not found', () => {
			const store = new CanvasStore();
			store.addShape(makeLine('exists'));
			store.updateShape(makeLine('ghost'));
			expect(store.getShapes()).toHaveLength(1);
			expect(store.getShapes()[0].id).toBe('exists');
		});
	});

	describe('page management', () => {
		it('addPage creates a new page and sets it active', () => {
			const store = new CanvasStore();
			store.addPage('New Page');
			expect(store.getPages()).toHaveLength(2);
			expect(store.getPages()[1].name).toBe('New Page');
			expect(appState.activePageId).toBe(store.getPages()[1].id);
		});

		it('addPage with no name uses default naming', () => {
			const store = new CanvasStore();
			store.addPage();
			expect(store.getPages()[1].name).toBe('Page 2');
		});

		it('setActivePage switches the active page', () => {
			const store = new CanvasStore();
			store.addPage('Second');
			const secondId = store.getPages()[1].id;
			store.setActivePage('page-1');
			expect(appState.activePageId).toBe('page-1');
			store.setActivePage(secondId);
			expect(appState.activePageId).toBe(secondId);
		});

		it('shapes are isolated per page', () => {
			const store = new CanvasStore();
			store.addShape(makeLine('on-page-1'));

			store.addPage('Second');
			expect(store.getShapes()).toHaveLength(0);

			store.setActivePage('page-1');
			expect(store.getShapes()).toHaveLength(1);
			expect(store.getShapes()[0].id).toBe('on-page-1');
		});
	});

	describe('appState proxying', () => {
		it('getCurrentTool returns the current appState tool', () => {
			const store = new CanvasStore();
			appState.tool = ToolType.LINE;
			expect(store.getCurrentTool()).toBe(ToolType.LINE);
		});

		it('setCurrentTool updates appState.tool', () => {
			const store = new CanvasStore();
			store.setCurrentTool(ToolType.RECTANGLE);
			expect(appState.tool).toBe(ToolType.RECTANGLE);
		});

		it('getOffset returns the current appState offset', () => {
			const store = new CanvasStore();
			appState.offset = { x: 50, y: 75 };
			expect(store.getOffset()).toEqual({ x: 50, y: 75 });
		});

		it('setOffset updates appState.offset', () => {
			const store = new CanvasStore();
			store.setOffset({ x: 20, y: 30 });
			expect(appState.offset).toEqual({ x: 20, y: 30 });
		});
	});
});
