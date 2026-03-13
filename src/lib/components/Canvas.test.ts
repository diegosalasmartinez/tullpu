/**
 * Canvas.svelte — reactive effect regression tests.
 *
 * The critical invariant:
 *   The page-switch $effect ONLY re-runs when appState.activePageId changes.
 *   It must NOT re-run when appState.currentShape changes — otherwise selecting
 *   a shape would immediately wipe the selection (the regression fixed in
 *   Canvas.svelte via `untrack()`).
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { render } from '@testing-library/svelte';
import { flushSync } from 'svelte';
import Canvas from './Canvas.svelte';
import { appState } from '$lib/state.svelte';
import { ToolType, type Line, type Page } from '$lib/types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const makeLine = (): Line => ({
	id: 'test-line',
	type: ToolType.LINE,
	style: { stroke: '#000000', strokeWidth: 1, fill: null },
	start: { x: 0, y: 0 },
	end: { x: 100, y: 100 }
});

const makePages = (...ids: string[]): Page[] =>
	ids.map((id, i) => ({ id, name: `Page ${i + 1}`, shapes: [] }));

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

beforeEach(() => {
	localStorage.clear();
	appState.tool = ToolType.SELECTION;
	appState.currentShape = null;
	appState.offset = { x: 0, y: 0 };
	appState.startPosition = { x: 0, y: 0 };
	appState.pages = makePages('page-1');
	appState.activePageId = 'page-1';
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Canvas.svelte — page-switch effect isolation', () => {
	it('setting currentShape does NOT trigger the page-switch effect (regression guard)', async () => {
		render(Canvas);

		// Allow onMount and initial $effect run to settle
		await new Promise((r) => setTimeout(r, 0));

		// Simulate what CanvasDrawer.click() does: select a shape
		appState.currentShape = makeLine();

		// Flush any pending Svelte effects synchronously.
		// If untrack() is missing from Canvas.svelte, the $effect would re-run here
		// and set currentShape back to null — making this assertion fail.
		flushSync();

		expect(appState.currentShape).not.toBeNull();
		expect(appState.currentShape?.id).toBe('test-line');
	});

	it('switching activePageId clears currentShape', async () => {
		appState.pages = makePages('page-1', 'page-2');
		appState.activePageId = 'page-1';

		render(Canvas);
		await new Promise((r) => setTimeout(r, 0));

		// Select a shape on page 1
		appState.currentShape = makeLine();
		flushSync();
		expect(appState.currentShape).not.toBeNull();

		// Switch to page 2 — the $effect SHOULD run and clear currentShape
		appState.activePageId = 'page-2';
		flushSync();

		expect(appState.currentShape).toBeNull();
	});
});
