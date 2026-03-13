import { describe, it, expect, beforeEach } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import ToolBarOption from './ToolBarOption.svelte';
import { appState } from '$lib/state.svelte';
import { ToolType } from '$lib/types';

describe('ToolBarOption', () => {
	beforeEach(() => {
		appState.tool = ToolType.SELECTION;
	});

	it('renders 4 tool buttons', () => {
		const { getAllByRole } = render(ToolBarOption);
		expect(getAllByRole('button')).toHaveLength(4);
	});

	it('clicking the rectangle button sets tool to RECTANGLE', async () => {
		const { getAllByRole } = render(ToolBarOption);
		// options order: Selection(0), Rectangle(1), Circle(2), Line(3)
		await fireEvent.click(getAllByRole('button')[1]);
		expect(appState.tool).toBe(ToolType.RECTANGLE);
	});

	it('clicking the circle button sets tool to CIRCLE', async () => {
		const { getAllByRole } = render(ToolBarOption);
		await fireEvent.click(getAllByRole('button')[2]);
		expect(appState.tool).toBe(ToolType.CIRCLE);
	});

	it('clicking the line button sets tool to LINE', async () => {
		const { getAllByRole } = render(ToolBarOption);
		await fireEvent.click(getAllByRole('button')[3]);
		expect(appState.tool).toBe(ToolType.LINE);
	});

	it('clicking the selection button sets tool to SELECTION', async () => {
		appState.tool = ToolType.LINE;
		const { getAllByRole } = render(ToolBarOption);
		await fireEvent.click(getAllByRole('button')[0]);
		expect(appState.tool).toBe(ToolType.SELECTION);
	});

	it('active tool button has the highlight class', async () => {
		const { getAllByRole } = render(ToolBarOption);
		const buttons = getAllByRole('button');
		// SELECTION is active by default
		expect(buttons[0].className).toContain('bg-sky-300');
		expect(buttons[1].className).not.toContain('bg-sky-300');
		expect(buttons[2].className).not.toContain('bg-sky-300');
	});
});
