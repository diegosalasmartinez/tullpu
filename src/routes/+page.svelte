<script lang="ts">
	import Canvas from '$lib/components/Canvas.svelte';
	import ToolBar from '$lib/components/ToolBar.svelte';
	import ShapePanel from '$lib/components/ShapePanel.svelte';
</script>

<div class="tullpu-container select-none">
	<div class="tullpu-ui-wrapper pointer-events-none absolute inset-0 z-[4] m-4">
		<ToolBar />
		<ShapePanel />
	</div>

	<Canvas />
</div>
