import { writable } from 'svelte/store';
import { type ToolBarOptions } from '../types';

export const tool = writable<ToolBarOptions>('selection');
