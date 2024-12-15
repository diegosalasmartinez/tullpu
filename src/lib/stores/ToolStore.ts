import { writable } from 'svelte/store';
import { type ToolBarOptions } from '$lib/types';

export const currentTool = writable<ToolBarOptions>('selection');
