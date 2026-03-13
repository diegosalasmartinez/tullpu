import { describe, it, expect, beforeEach } from 'vitest';
import LineEntity from './LineEntity';
import { ToolType, type CanvasInstance } from '$lib/types';

const mockCanvas = (): CanvasInstance => ({
	html: {} as HTMLCanvasElement,
	context: {} as CanvasRenderingContext2D
});

describe('LineEntity', () => {
	let entity: LineEntity;

	beforeEach(() => {
		entity = new LineEntity(mockCanvas(), mockCanvas());
	});

	describe('createShape', () => {
		it('creates a line with correct start and end coords', () => {
			const shape = entity.createShape({ x: 10, y: 20 }, { x: 100, y: 200 });
			expect(shape.start).toEqual({ x: 10, y: 20 });
			expect(shape.end).toEqual({ x: 100, y: 200 });
			expect(shape.type).toBe(ToolType.LINE);
		});

		it('has default style', () => {
			const shape = entity.createShape({ x: 0, y: 0 }, { x: 10, y: 10 });
			expect(shape.style.stroke).toBe('#000000');
			expect(shape.style.strokeWidth).toBe(1);
			expect(shape.style.fill).toBeNull();
		});

		it('assigns unique ids to the shape', () => {
			const a = entity.createShape({ x: 0, y: 0 }, { x: 10, y: 10 });
			const b = entity.createShape({ x: 0, y: 0 }, { x: 10, y: 10 });
			expect(a.id).not.toBe(b.id);
		});
	});

	describe('getNodes', () => {
		it('returns start and end nodes with correct positions', () => {
			const shape = entity.createShape({ x: 5, y: 10 }, { x: 50, y: 100 });
			const nodes = entity.getNodes(shape);
			expect(nodes).toHaveLength(2);
			expect(nodes[0]).toMatchObject({ id: 'start', x: 5, y: 10 });
			expect(nodes[1]).toMatchObject({ id: 'end', x: 50, y: 100 });
		});

		it('reflects current shape coords (computed, not stored)', () => {
			const shape = entity.createShape({ x: 0, y: 0 }, { x: 100, y: 100 });
			shape.start = { x: 20, y: 30 };
			const nodes = entity.getNodes(shape);
			expect(nodes[0]).toMatchObject({ id: 'start', x: 20, y: 30 });
		});
	});

	describe('updateFromNode', () => {
		it('updates start when nodeId is "start"', () => {
			const shape = entity.createShape({ x: 0, y: 0 }, { x: 100, y: 100 });
			entity.updateFromNode(shape, 'start', 30, 40);
			expect(shape.start).toEqual({ x: 30, y: 40 });
			expect(shape.end).toEqual({ x: 100, y: 100 });
		});

		it('updates end when nodeId is "end"', () => {
			const shape = entity.createShape({ x: 0, y: 0 }, { x: 100, y: 100 });
			entity.updateFromNode(shape, 'end', 200, 250);
			expect(shape.end).toEqual({ x: 200, y: 250 });
			expect(shape.start).toEqual({ x: 0, y: 0 });
		});
	});

	describe('isClicked', () => {
		it('returns true for a point on a horizontal line', () => {
			const shape = entity.createShape({ x: 0, y: 50 }, { x: 100, y: 50 });
			expect(entity.isClicked(shape, 50, 50)).toBe(true);
		});

		it('returns true for a point on a vertical line', () => {
			const shape = entity.createShape({ x: 50, y: 0 }, { x: 50, y: 100 });
			expect(entity.isClicked(shape, 50, 50)).toBe(true);
		});

		it('returns true for a point near a diagonal line', () => {
			const shape = entity.createShape({ x: 0, y: 0 }, { x: 100, y: 100 });
			expect(entity.isClicked(shape, 50, 50)).toBe(true);
		});

		it('returns true for a point within the hit tolerance', () => {
			const shape = entity.createShape({ x: 0, y: 0 }, { x: 100, y: 0 });
			// 5px above the horizontal line, within 7px tolerance
			expect(entity.isClicked(shape, 50, 5)).toBe(true);
		});

		it('returns false for a point too far from the line', () => {
			const shape = entity.createShape({ x: 0, y: 0 }, { x: 100, y: 0 });
			// 20px away — outside the 7px hit tolerance
			expect(entity.isClicked(shape, 50, 20)).toBe(false);
		});

		it('returns false for a point completely off to the side', () => {
			const shape = entity.createShape({ x: 0, y: 0 }, { x: 100, y: 100 });
			expect(entity.isClicked(shape, 0, 100)).toBe(false);
		});
	});
});
