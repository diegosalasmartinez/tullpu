import { writable } from 'svelte/store';
import { type ToolBarOptions } from '../types';

export const currentTool = writable<ToolBarOptions>('selection');
