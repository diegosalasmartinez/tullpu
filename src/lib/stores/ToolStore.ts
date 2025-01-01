import { writable } from 'svelte/store';
import { ToolType } from '$lib/types';

export const currentTool = writable<ToolType>(ToolType.SELECTION);
