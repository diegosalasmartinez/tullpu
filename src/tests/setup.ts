import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

// ---------------------------------------------------------------------------
// Canvas 2D context mock
// ---------------------------------------------------------------------------
// happy-dom does not implement the Canvas 2D API — getContext('2d') returns null.
// The Canvas class constructor throws in that case, making any component test
// that mounts a <canvas> fail. This global mock returns stub implementations
// so canvas operations silently no-op in tests.

const makeContext2D = () => ({
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
	setTransform: vi.fn(),
	fillStyle: '',
	strokeStyle: '',
	lineWidth: 1
});

HTMLCanvasElement.prototype.getContext = function (contextId: string) {
	if (contextId === '2d') return makeContext2D() as unknown as CanvasRenderingContext2D;
	return null;
} as typeof HTMLCanvasElement.prototype.getContext;
