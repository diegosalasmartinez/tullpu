<script lang="ts">
	import { ToolType, type Coords } from '$lib/types';
	import { enablePointerEvents } from '$lib/stores/ToolStore';
	import { currentShape } from '$lib/stores/ShapeStore';

	const parseCoordsObject = (coords: Coords) => {
		return `${coords.x}, ${coords.y}`;
	};
</script>

{#if $currentShape}
	<div class={`absolute left-0 top-0 ${$enablePointerEvents}`}>
		<div class="rounded-lg border-[1px] border-gray-200 bg-white px-4 py-2 text-xs shadow-sm">
			<h3 class="font-bold">Shape:</h3>
			<p>{$currentShape.id}</p>
			<br />

			{#if $currentShape.type == ToolType.RECTANGLE}
				<p>Coords: {parseCoordsObject($currentShape.coords)}</p>
				<p>Width: {$currentShape.width}</p>
				<p>Height: {$currentShape.height}</p>
			{/if}

			{#if $currentShape.type == ToolType.LINE}
				<p>Start: {parseCoordsObject($currentShape.coordsStart)}</p>
				<p>End: {parseCoordsObject($currentShape.coordsEnd)}</p>
			{/if}
			<br />

			<h3 class="font-bold">Nodes:</h3>
			{#each $currentShape.nodes as node, index}
				<p>{index}. {parseCoordsObject(node)}</p>
			{/each}
		</div>
	</div>
{/if}
