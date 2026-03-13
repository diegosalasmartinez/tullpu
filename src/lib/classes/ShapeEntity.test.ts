import { describe, it, expect, beforeEach } from 'vitest';
import ShapeEntity from './ShapeEntity';
import { ToolType, type CanvasInstance, type Line } from '$lib/types';
import { appState } from '$lib/state.svelte';

const mockCanvas = (): CanvasInstance => ({
	html: {} as HTMLCanvasElement,
	context: {} as CanvasRenderingContext2D
});

const makeLine = (): Line => ({
	id: 'line-1',
	type: ToolType.LINE,
	style: { stroke: '#000000', strokeWidth: 1, fill: null },
	start: { x: 0, y: 0 },
	end: { x: 100, y: 100 }
});

describe('ShapeEntity', () => {
	let entity: ShapeEntity;

	beforeEach(() => {
		entity = new ShapeEntity(mockCanvas(), mockCanvas());
		appState.tool = ToolType.SELECTION;
	});

	describe('getNodeSelected', () => {
		it('returns the start node when the point is within the proximity radius', () => {
			const line = makeLine();
			// proximity radius is 5 — point at (3, 3) is within radius of start at (0, 0)
			const node = entity.getNodeSelected(line, 3, 3);
			expect(node).not.toBeNull();
			expect(node?.id).toBe('start');
		});

		it('returns the end node when near the end point', () => {
			const line = makeLine();
			const node = entity.getNodeSelected(line, 97, 102);
			expect(node?.id).toBe('end');
		});

		it('returns null when the point is outside any node radius', () => {
			const line = makeLine();
			const node = entity.getNodeSelected(line, 50, 50);
			expect(node).toBeNull();
		});
	});

	describe('updateShapeFromNode', () => {
		it('updates start when moving the start node', () => {
			const line = makeLine();
			entity.updateShapeFromNode(line, 'start', 30, 40);

			expect(line.start).toEqual({ x: 30, y: 40 });
			expect(line.end).toEqual({ x: 100, y: 100 });
		});

		it('updates end when moving the end node', () => {
			const line = makeLine();
			entity.updateShapeFromNode(line, 'end', 200, 250);

			expect(line.end).toEqual({ x: 200, y: 250 });
			expect(line.start).toEqual({ x: 0, y: 0 });
		});
	});
});
