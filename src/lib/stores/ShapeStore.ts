import { writable } from 'svelte/store';
import { type Shape } from '../types';

export const currentShape = writable<Shape | null>(null);
