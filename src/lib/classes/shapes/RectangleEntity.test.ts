import { describe, it, expect, beforeEach } from 'vitest';
import RectangleEntity from './RectangleEntity';
import { ToolType, type CanvasInstance } from '$lib/types';

const mockCanvas = (): CanvasInstance => ({
	html: {} as HTMLCanvasElement,
	context: {} as CanvasRenderingContext2D
});

describe('RectangleEntity', () => {
	let entity: RectangleEntity;

	beforeEach(() => {
		entity = new RectangleEntity(mockCanvas(), mockCanvas());
	});

	describe('createShape', () => {
		it('creates a rectangle with correct coords and dimensions', () => {
			const shape = entity.createShape({ x: 10, y: 20 }, { x: 110, y: 120 });
			expect(shape.x).toBe(10);
			expect(shape.y).toBe(20);
			expect(shape.width).toBe(100);
			expect(shape.height).toBe(100);
			expect(shape.type).toBe(ToolType.RECTANGLE);
		});

		it('normalizes when drawn right-to-left (negative width)', () => {
			const shape = entity.createShape({ x: 100, y: 20 }, { x: 10, y: 120 });
			expect(shape.x).toBe(10);
			expect(shape.width).toBe(90);
		});

		it('normalizes when drawn bottom-to-top (negative height)', () => {
			const shape = entity.createShape({ x: 10, y: 120 }, { x: 110, y: 20 });
			expect(shape.y).toBe(20);
			expect(shape.height).toBe(100);
		});

		it('normalizes when drawn in any diagonal direction', () => {
			const shape = entity.createShape({ x: 200, y: 300 }, { x: 50, y: 100 });
			expect(shape.x).toBe(50);
			expect(shape.y).toBe(100);
			expect(shape.width).toBe(150);
			expect(shape.height).toBe(200);
		});

		it('has default style', () => {
			const shape = entity.createShape({ x: 0, y: 0 }, { x: 100, y: 100 });
			expect(shape.style.stroke).toBe('#000000');
			expect(shape.style.strokeWidth).toBe(1);
			expect(shape.style.fill).toBeNull();
		});
	});

	describe('getNodes', () => {
		it('returns 4 corner nodes at correct positions', () => {
			const shape = entity.createShape({ x: 0, y: 0 }, { x: 100, y: 50 });
			const nodes = entity.getNodes(shape);
			expect(nodes).toHaveLength(4);
			expect(nodes[0]).toMatchObject({ id: 'tl', x: 0, y: 0 });
			expect(nodes[1]).toMatchObject({ id: 'tr', x: 100, y: 0 });
			expect(nodes[2]).toMatchObject({ id: 'br', x: 100, y: 50 });
			expect(nodes[3]).toMatchObject({ id: 'bl', x: 0, y: 50 });
		});

		it('reflects current shape coords (computed, not stored)', () => {
			const shape = entity.createShape({ x: 0, y: 0 }, { x: 100, y: 100 });
			shape.x = 10;
			shape.y = 20;
			const nodes = entity.getNodes(shape);
			expect(nodes[0]).toMatchObject({ id: 'tl', x: 10, y: 20 });
		});
	});

	describe('updateFromNode', () => {
		it('drags br corner while fixing tl', () => {
			const shape = entity.createShape({ x: 0, y: 0 }, { x: 100, y: 100 });
			entity.updateFromNode(shape, 'br', 150, 200);
			expect(shape.x).toBe(0);
			expect(shape.y).toBe(0);
			expect(shape.width).toBe(150);
			expect(shape.height).toBe(200);
		});

		it('drags tl corner while fixing br', () => {
			const shape = entity.createShape({ x: 0, y: 0 }, { x: 100, y: 100 });
			entity.updateFromNode(shape, 'tl', 20, 30);
			expect(shape.x).toBe(20);
			expect(shape.y).toBe(30);
			expect(shape.width).toBe(80);
			expect(shape.height).toBe(70);
		});

		it('drags tr corner while fixing bl', () => {
			const shape = entity.createShape({ x: 0, y: 0 }, { x: 100, y: 100 });
			entity.updateFromNode(shape, 'tr', 150, 0);
			expect(shape.x).toBe(0);
			expect(shape.y).toBe(0);
			expect(shape.width).toBe(150);
			expect(shape.height).toBe(100);
		});

		it('drags bl corner while fixing tr', () => {
			const shape = entity.createShape({ x: 0, y: 0 }, { x: 100, y: 100 });
			entity.updateFromNode(shape, 'bl', 0, 150);
			expect(shape.x).toBe(0);
			expect(shape.y).toBe(0);
			expect(shape.width).toBe(100);
			expect(shape.height).toBe(150);
		});

		it('normalizes when dragging tl past br', () => {
			const shape = entity.createShape({ x: 0, y: 0 }, { x: 100, y: 100 });
			entity.updateFromNode(shape, 'tl', 150, 150);
			expect(shape.x).toBe(100);
			expect(shape.y).toBe(100);
			expect(shape.width).toBe(50);
			expect(shape.height).toBe(50);
		});
	});

	describe('isClicked', () => {
		it('returns true for a point inside the rectangle', () => {
			const shape = entity.createShape({ x: 0, y: 0 }, { x: 100, y: 100 });
			expect(entity.isClicked(shape, 50, 50)).toBe(true);
		});

		it('returns true for a point on the top-left corner (boundary)', () => {
			const shape = entity.createShape({ x: 0, y: 0 }, { x: 100, y: 100 });
			expect(entity.isClicked(shape, 0, 0)).toBe(true);
		});

		it('returns true for a point on the bottom-right corner (boundary)', () => {
			const shape = entity.createShape({ x: 0, y: 0 }, { x: 100, y: 100 });
			expect(entity.isClicked(shape, 100, 100)).toBe(true);
		});

		it('returns false for a point outside the rectangle', () => {
			const shape = entity.createShape({ x: 0, y: 0 }, { x: 100, y: 100 });
			expect(entity.isClicked(shape, 150, 50)).toBe(false);
		});

		it('returns false for a point above the rectangle', () => {
			const shape = entity.createShape({ x: 0, y: 50 }, { x: 100, y: 150 });
			expect(entity.isClicked(shape, 50, 10)).toBe(false);
		});
	});
});
