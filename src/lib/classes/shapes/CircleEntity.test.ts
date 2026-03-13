import { describe, it, expect, beforeEach } from 'vitest';
import CircleEntity from './CircleEntity';
import { ToolType, type CanvasInstance } from '$lib/types';

const mockCanvas = (): CanvasInstance => ({
	html: {} as HTMLCanvasElement,
	context: {} as CanvasRenderingContext2D
});

describe('CircleEntity', () => {
	let entity: CircleEntity;

	beforeEach(() => {
		entity = new CircleEntity(mockCanvas(), mockCanvas());
	});

	describe('createShape', () => {
		it('computes center and radii from the drag bounding box', () => {
			// drag from (0,0) to (100,60)
			const shape = entity.createShape({ x: 0, y: 0 }, { x: 100, y: 60 });
			expect(shape.cx).toBe(50);
			expect(shape.cy).toBe(30);
			expect(shape.rx).toBe(50);
			expect(shape.ry).toBe(30);
			expect(shape.type).toBe(ToolType.CIRCLE);
		});

		it('works regardless of drag direction', () => {
			// drag from bottom-right to top-left
			const shape = entity.createShape({ x: 100, y: 80 }, { x: 0, y: 0 });
			expect(shape.cx).toBe(50);
			expect(shape.cy).toBe(40);
			expect(shape.rx).toBe(50);
			expect(shape.ry).toBe(40);
		});

		it('has default style', () => {
			const shape = entity.createShape({ x: 0, y: 0 }, { x: 50, y: 50 });
			expect(shape.style.stroke).toBe('#000000');
			expect(shape.style.strokeWidth).toBe(1);
			expect(shape.style.fill).toBeNull();
		});

		it('assigns unique ids', () => {
			const a = entity.createShape({ x: 0, y: 0 }, { x: 50, y: 50 });
			const b = entity.createShape({ x: 0, y: 0 }, { x: 50, y: 50 });
			expect(a.id).not.toBe(b.id);
		});
	});

	describe('getNodes', () => {
		it('returns 4 cardinal nodes at the correct positions', () => {
			const shape = entity.createShape({ x: 0, y: 0 }, { x: 100, y: 60 });
			// cx=50, cy=30, rx=50, ry=30
			const nodes = entity.getNodes(shape);
			expect(nodes).toHaveLength(4);
			expect(nodes.find((n) => n.id === 'top')).toMatchObject({ x: 50, y: 0 });
			expect(nodes.find((n) => n.id === 'right')).toMatchObject({ x: 100, y: 30 });
			expect(nodes.find((n) => n.id === 'bottom')).toMatchObject({ x: 50, y: 60 });
			expect(nodes.find((n) => n.id === 'left')).toMatchObject({ x: 0, y: 30 });
		});

		it('reflects current shape geometry (computed, not stored)', () => {
			const shape = entity.createShape({ x: 0, y: 0 }, { x: 100, y: 100 });
			shape.rx = 20;
			const nodes = entity.getNodes(shape);
			expect(nodes.find((n) => n.id === 'right')?.x).toBe(shape.cx + 20);
		});
	});

	describe('updateFromNode', () => {
		it('dragging "right" updates rx', () => {
			const shape = entity.createShape({ x: 0, y: 0 }, { x: 100, y: 100 });
			// cx=50, rx=50
			entity.updateFromNode(shape, 'right', 80, 50);
			expect(shape.rx).toBe(30); // |80 - 50|
			expect(shape.ry).toBe(50); // unchanged
		});

		it('dragging "left" updates rx symmetrically', () => {
			const shape = entity.createShape({ x: 0, y: 0 }, { x: 100, y: 100 });
			entity.updateFromNode(shape, 'left', 20, 50);
			expect(shape.rx).toBe(30); // |20 - 50|
		});

		it('dragging "top" updates ry', () => {
			const shape = entity.createShape({ x: 0, y: 0 }, { x: 100, y: 100 });
			// cy=50, ry=50
			entity.updateFromNode(shape, 'top', 50, 20);
			expect(shape.ry).toBe(30); // |20 - 50|
			expect(shape.rx).toBe(50); // unchanged
		});

		it('dragging "bottom" updates ry', () => {
			const shape = entity.createShape({ x: 0, y: 0 }, { x: 100, y: 100 });
			entity.updateFromNode(shape, 'bottom', 50, 90);
			expect(shape.ry).toBe(40); // |90 - 50|
		});

		it('clamps radius to a minimum of 1', () => {
			const shape = entity.createShape({ x: 0, y: 0 }, { x: 100, y: 100 });
			entity.updateFromNode(shape, 'right', 50, 50); // x === cx → |50-50| = 0 → clamp to 1
			expect(shape.rx).toBe(1);
		});
	});

	describe('isClicked', () => {
		it('returns true for a point inside the ellipse', () => {
			const shape = entity.createShape({ x: 0, y: 0 }, { x: 100, y: 100 });
			// cx=50, cy=50, rx=50, ry=50 → circle of r=50 centered at (50,50)
			expect(entity.isClicked(shape, 50, 50)).toBe(true); // center
			expect(entity.isClicked(shape, 70, 50)).toBe(true); // inside
		});

		it('returns true for a point on the boundary', () => {
			const shape = entity.createShape({ x: 0, y: 0 }, { x: 100, y: 100 });
			// rightmost point: (100, 50) → (100-50)²/50² + 0 = 1 ✓
			expect(entity.isClicked(shape, 100, 50)).toBe(true);
		});

		it('returns false for a point outside the ellipse', () => {
			const shape = entity.createShape({ x: 0, y: 0 }, { x: 100, y: 100 });
			expect(entity.isClicked(shape, 0, 0)).toBe(false); // corner of bounding box
			expect(entity.isClicked(shape, 200, 50)).toBe(false); // far outside
		});

		it('handles non-circular ellipses correctly', () => {
			// wide ellipse: drag (0,0)→(200,40) → cx=100, cy=20, rx=100, ry=20
			const shape = entity.createShape({ x: 0, y: 0 }, { x: 200, y: 40 });
			expect(entity.isClicked(shape, 100, 20)).toBe(true); // center
			expect(entity.isClicked(shape, 100, 0)).toBe(true); // top edge
			expect(entity.isClicked(shape, 100, 45)).toBe(false); // 25 units past center, outside ry=20
		});
	});
});
