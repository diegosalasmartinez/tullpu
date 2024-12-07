<script lang="ts">
	import { type ToolBarOptions } from '$lib/types';
	import Canvas from '$lib/classes/canvas';
	import { onMount, onDestroy } from 'svelte';
	import ToolBar from '$lib/components/ToolBar.svelte';

	let canvasElement: HTMLCanvasElement | null = null;
	let canvas: Canvas | null = null;

	const setTool = (tool: ToolBarOptions) => {
		if (!canvas) return;
		canvas.setTool(tool);
	};

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

<ToolBar {setTool} />
<canvas bind:this={canvasElement} class="absolute active:cursor-grabbing"></canvas>
