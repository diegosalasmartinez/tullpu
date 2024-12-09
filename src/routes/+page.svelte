<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import Canvas from '$lib/classes/Canvas';
	import ToolBar from '$lib/components/ToolBar.svelte';

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

<ToolBar />

<canvas bind:this={canvasStatic} class="canvas-static absolute active:cursor-grabbing"></canvas>
<div>
	<canvas bind:this={canvasInteractive} class="canvas-interactive absolute active:cursor-grabbing">
	</canvas>
</div>
