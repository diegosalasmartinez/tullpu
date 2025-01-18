import { derived, writable } from 'svelte/store';
import { ActionType, ToolType } from '$lib/types';

export const currentTool = writable<ToolType>(ToolType.SELECTION);
export const currentAction = writable<ActionType>(ActionType.IDLE);

export const enablePointerEvents = derived(currentAction, ($currentAction) => {
	if ($currentAction === ActionType.IDLE) return 'pointer-events-auto';
	return 'pointer-events-none';
});
