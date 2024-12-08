<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import Canvas from '$lib/classes/Canvas';
	import ToolBar from '$lib/components/ToolBar.svelte';

	let canvasElement: HTMLCanvasElement | null = null;
	let canvas: Canvas | null = null;

	onMount(() => {
		if (!canvasElement) return;
		canvas = new Canvas(canvasElement);
		canvas.resizeCanvas();
	});

	onDestroy(() => {
		if (!canvas) return;
		canvas.destroy();
	});
</script>

<ToolBar />
<canvas bind:this={canvasElement} class="absolute active:cursor-grabbing"></canvas>
