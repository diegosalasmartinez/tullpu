import { writable } from 'svelte/store';
import { type Coords } from '$lib/types';

export const currentOffset = writable<Coords>({ x: 0, y: 0 });
export const currentStartPosition = writable<Coords>({ x: 0, y: 0 });
