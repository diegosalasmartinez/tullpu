import { describe, it, expect, beforeEach, vi } from 'vitest';
import CanvasDrawer from './CanvasDrawer';
import CanvasStore from './CanvasStore';
import { ToolType, type CanvasInstance, type Line, type Page } from '$lib/types';
import { appState } from '$lib/state.svelte';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const makeMockContext = () =>
	({
		clearRect: vi.fn(),
		fillRect: vi.fn(),
		strokeRect: vi.fn(),
		beginPath: vi.fn(),
		moveTo: vi.fn(),
		lineTo: vi.fn(),
		stroke: vi.fn(),
		fill: vi.fn(),
		arc: vi.fn(),
		closePath: vi.fn(),
		save: vi.fn(),
		restore: vi.fn(),
		translate: vi.fn(),
		setLineDash: vi.fn(),
		ellipse: vi.fn(),
		fillStyle: '',
		strokeStyle: '',
		lineWidth: 1
	}) as unknown as CanvasRenderingContext2D;

const makeMockCanvas = (): CanvasInstance => ({
	html: {
		width: 800,
		height: 600,
		style: { cursor: '' },
		getBoundingClientRect: vi.fn(() => ({ left: 0, top: 0, width: 800, height: 600 }))
	} as unknown as HTMLCanvasElement,
	context: makeMockContext()
});

const makeMouseEvent = (x: number, y: number): MouseEvent =>
	({ clientX: x, clientY: y }) as MouseEvent;

const makeLine = (id = 'line-1'): Line => ({
	id,
	type: ToolType.LINE,
	style: { stroke: '#000000', strokeWidth: 1, fill: null },
	start: { x: 50, y: 50 },
	end: { x: 150, y: 150 }
});

const makeDefaultPages = (): Page[] => [{ id: 'page-1', name: 'Page 1', shapes: [] }];

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

beforeEach(() => {
	localStorage.clear();
	appState.tool = ToolType.SELECTION;
	appState.currentShape = null;
	appState.offset = { x: 0, y: 0 };
	appState.startPosition = { x: 0, y: 0 };
	appState.pages = makeDefaultPages();
	appState.activePageId = 'page-1';
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('CanvasDrawer', () => {
	describe('click', () => {
		it('sets currentShape when clicking on a shape', () => {
			const store = new CanvasStore();
			const line = makeLine();
			store.addShape(line);

			const drawer = new CanvasDrawer(makeMockCanvas(), makeMockCanvas(), store);

			// Click exactly on the midpoint of the line (50,50)→(150,150): midpoint is (100,100)
			drawer.click(makeMouseEvent(100, 100));

			expect(store.getCurrentShape()).not.toBeNull();
			expect(store.getCurrentShape()?.id).toBe('line-1');
		});

		it('clears currentShape when clicking on empty space', () => {
			const store = new CanvasStore();
			store.addShape(makeLine());
			appState.currentShape = makeLine('other');

			const drawer = new CanvasDrawer(makeMockCanvas(), makeMockCanvas(), store);

			// Click far away from the line
			drawer.click(makeMouseEvent(500, 500));

			expect(store.getCurrentShape()).toBeNull();
		});

		it('currentShape stays set after click — not wiped by a subsequent call', () => {
			const store = new CanvasStore();
			const line = makeLine();
			store.addShape(line);

			const drawer = new CanvasDrawer(makeMockCanvas(), makeMockCanvas(), store);
			drawer.click(makeMouseEvent(100, 100));

			// A second read should still return the shape (no side effect clears it)
			expect(store.getCurrentShape()?.id).toBe('line-1');
		});
	});

	describe('startEditing / getNodeSelected', () => {
		it('sets nodeSelected when mousedown is near a line endpoint', () => {
			const store = new CanvasStore();
			const line = makeLine();
			store.addShape(line);

			const drawer = new CanvasDrawer(makeMockCanvas(), makeMockCanvas(), store);

			// Click at (52, 52) — within 5px of start node at (50, 50)
			drawer.startEditing(makeMouseEvent(52, 52), line);

			// editing() should move the start node (not return early)
			drawer.editing(makeMouseEvent(60, 60));

			// start should have moved
			expect(line.start).toEqual({ x: 60, y: 60 });
			expect(line.end).toEqual({ x: 150, y: 150 });
		});

		it('does not update shape when mousedown is not near any node', () => {
			const store = new CanvasStore();
			const line = makeLine();
			store.addShape(line);

			const drawer = new CanvasDrawer(makeMockCanvas(), makeMockCanvas(), store);

			// Click at midpoint (100, 100) — not near start (50,50) or end (150,150)
			drawer.startEditing(makeMouseEvent(100, 100), line);
			drawer.editing(makeMouseEvent(200, 200));

			// Coords should be unchanged
			expect(line.start).toEqual({ x: 50, y: 50 });
			expect(line.end).toEqual({ x: 150, y: 150 });
		});
	});

	describe('stopEditing', () => {
		it('persists the updated shape to the store', () => {
			const store = new CanvasStore();
			const line = makeLine();
			store.addShape(line);

			const drawer = new CanvasDrawer(makeMockCanvas(), makeMockCanvas(), store);
			drawer.startEditing(makeMouseEvent(52, 52), line);
			drawer.editing(makeMouseEvent(80, 80));
			drawer.stopEditing();

			const saved = store.getShapes()[0] as Line;
			expect(saved.start).toEqual({ x: 80, y: 80 });
		});

		it('clears shapeEditing and nodeSelected after stop', () => {
			const store = new CanvasStore();
			const line = makeLine();
			store.addShape(line);

			const drawer = new CanvasDrawer(makeMockCanvas(), makeMockCanvas(), store);
			drawer.startEditing(makeMouseEvent(52, 52), line);
			drawer.stopEditing();

			// After stop, further editing should be a no-op
			const startBefore = { ...line.start };
			drawer.editing(makeMouseEvent(999, 999));
			expect(line.start).toEqual(startBefore);
		});
	});

	describe('stopDrawing', () => {
		it('switches to SELECTION tool and auto-selects the new shape', () => {
			appState.tool = ToolType.LINE;
			const store = new CanvasStore();
			const drawer = new CanvasDrawer(makeMockCanvas(), makeMockCanvas(), store);

			store.setStartPosition({ x: 0, y: 0 });
			drawer.stopDrawing(makeMouseEvent(100, 100));

			expect(store.getCurrentTool()).toBe(ToolType.SELECTION);
			expect(store.getCurrentShape()).not.toBeNull();
			expect(store.getCurrentShape()?.type).toBe(ToolType.LINE);
		});

		it('does not switch tool when start and end are the same point', () => {
			appState.tool = ToolType.LINE;
			const store = new CanvasStore();
			const drawer = new CanvasDrawer(makeMockCanvas(), makeMockCanvas(), store);

			store.setStartPosition({ x: 50, y: 50 });
			drawer.stopDrawing(makeMouseEvent(50, 50));

			expect(store.getCurrentTool()).toBe(ToolType.LINE);
			expect(store.getCurrentShape()).toBeNull();
		});
	});

	describe('deleteSelectedShape', () => {
		it('removes the selected shape and clears currentShape', () => {
			const store = new CanvasStore();
			const line = makeLine();
			store.addShape(line);
			store.setCurrentShape(line);

			const drawer = new CanvasDrawer(makeMockCanvas(), makeMockCanvas(), store);
			drawer.deleteSelectedShape();

			expect(store.getShapes()).toHaveLength(0);
			expect(store.getCurrentShape()).toBeNull();
		});

		it('does nothing when no shape is selected', () => {
			const store = new CanvasStore();
			store.addShape(makeLine());

			const drawer = new CanvasDrawer(makeMockCanvas(), makeMockCanvas(), store);
			drawer.deleteSelectedShape();

			expect(store.getShapes()).toHaveLength(1);
		});
	});

	describe('hasSelectedShape', () => {
		it('returns the shape when the cursor is on it', () => {
			const store = new CanvasStore();
			store.addShape(makeLine());

			const drawer = new CanvasDrawer(makeMockCanvas(), makeMockCanvas(), store);
			const found = drawer.hasSelectedShape(makeMouseEvent(100, 100));

			expect(found).not.toBeNull();
			expect(found?.id).toBe('line-1');
		});

		it('returns null when the cursor is not on any shape', () => {
			const store = new CanvasStore();
			store.addShape(makeLine());

			const drawer = new CanvasDrawer(makeMockCanvas(), makeMockCanvas(), store);
			const found = drawer.hasSelectedShape(makeMouseEvent(500, 500));

			expect(found).toBeNull();
		});
	});
});
