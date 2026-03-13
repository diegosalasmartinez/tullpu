<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { untrack } from 'svelte';
	import Canvas from '$lib/classes/Canvas';
	import { appState } from '$lib/state.svelte';

	let canvasStatic = $state<HTMLCanvasElement | null>(null);
	let canvasInteractive = $state<HTMLCanvasElement | null>(null);
	let canvas = $state<Canvas | null>(null);

	onMount(() => {
		if (!canvasStatic || !canvasInteractive) return;
		canvas = new Canvas(canvasStatic, canvasInteractive);
		canvas.resizeCanvas();
	});

	onDestroy(() => {
		if (!canvas) return;
		canvas.destroy();
	});

	// Only re-run when activePageId changes (page switch).
	// untrack prevents redrawAll() reads from becoming reactive dependencies,
	// which would otherwise wipe currentShape every time a shape is selected.
	$effect(() => {
		appState.activePageId;
		untrack(() => {
			if (!canvas) return;
			appState.currentShape = null;
			canvas.cancelEditing();
			canvas.redrawAll();
		});
	});
</script>

<canvas bind:this={canvasStatic} class="canvas canvas-static"></canvas>
<div>
	<canvas bind:this={canvasInteractive} class="canvas canvas-interactive"></canvas>
</div>

<style lang="postcss">
	.canvas {
		@apply absolute active:cursor-grabbing;
	}
</style>
