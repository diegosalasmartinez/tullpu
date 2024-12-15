import { writable } from 'svelte/store';
import { type Shape } from '$lib/types';

export const currentShape = writable<Shape | null>(null);
