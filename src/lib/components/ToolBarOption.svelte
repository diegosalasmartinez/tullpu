<script lang="ts">
	import { ToolType } from '$lib/types';
	import type { Component } from 'svelte';
	import ArrowIcon from '$lib/icons/Arrow.svelte';
	import RectangleIcon from '$lib/icons/Rectangle.svelte';
	import LineIcon from '$lib/icons/Line.svelte';
	import CircleIcon from '$lib/icons/Circle.svelte';
	import { appState } from '$lib/state.svelte';

	const options: { name: string; value: ToolType; icon: Component }[] = [
		{ name: 'Selection', value: ToolType.SELECTION, icon: ArrowIcon },
		{ name: 'Rectangle', value: ToolType.RECTANGLE, icon: RectangleIcon },
		{ name: 'Circle', value: ToolType.CIRCLE, icon: CircleIcon },
		{ name: 'Line', value: ToolType.LINE, icon: LineIcon }
	];
</script>

<div
	class="mx-auto flex w-max justify-center gap-1 rounded-lg border-[1px] border-gray-200 bg-white p-1 text-sm shadow-sm"
>
	{#each options as { name, value, icon: Icon }}
		<button
			class={`rounded-lg px-2.5 py-2 transition-colors ${
				appState.tool === value ? 'bg-sky-300' : 'hover:bg-sky-100'
			}`}
			onclick={() => (appState.tool = value)}
		>
			<Icon className="size-5" />
		</button>
	{/each}
</div>
