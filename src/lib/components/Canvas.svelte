<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import Canvas from '$lib/classes/Canvas';

	let canvasStatic: HTMLCanvasElement | null = null;
	let canvasInteractive: HTMLCanvasElement | null = null;
	let canvas: Canvas | null = null;

	onMount(() => {
		if (!canvasStatic || !canvasInteractive) return;
		canvas = new Canvas(canvasStatic, canvasInteractive);
		canvas.resizeCanvas();
	});

	onDestroy(() => {
		if (!canvas) return;
		canvas.destroy();
	});
</script>

<div>
	<canvas bind:this={canvasStatic} class="canvas canvas-static pointer-events-none z-[1]"></canvas>
</div>

<canvas bind:this={canvasInteractive} class="canvas canvas-interactive z-[2]"></canvas>

<style lang="postcss">
	.canvas {
		@apply absolute active:cursor-grabbing;
	}
</style>
