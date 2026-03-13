import { ToolType, type Shape, type Coords, type Page } from '$lib/types';

export const appState = $state({
	tool: ToolType.SELECTION as ToolType,
	currentShape: null as Shape | null,
	offset: { x: 0, y: 0 } as Coords,
	startPosition: { x: 0, y: 0 } as Coords,
	pages: [] as Page[],
	activePageId: ''
});
