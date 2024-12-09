<script lang="ts">
	import { type ToolBarOptions } from '$lib/types';
	import type { Component } from 'svelte';
	import ArrowIcon from '$lib/icons/Arrow.svelte';
	import RectangleIcon from '$lib/icons/Rectangle.svelte';
	import LineIcon from '$lib/icons/Line.svelte';
	import { currentTool } from '$lib/stores/ToolStore';

	const options: { name: string; value: ToolBarOptions; icon: Component }[] = [
		{ name: 'Selection', value: 'selection', icon: ArrowIcon },
		{ name: 'Rectangle', value: 'rectangle', icon: RectangleIcon },
		{ name: 'Line', value: 'line', icon: LineIcon }
	];
</script>

<div
	class="mx-auto flex w-max justify-center gap-1 rounded-lg border-[1px] border-gray-200 bg-white p-1 text-sm shadow-sm"
>
	{#each options as option}
		<button
			class={`rounded-lg px-2.5 py-2 transition-colors ${
				$currentTool === option.value ? 'bg-sky-300' : 'hover:bg-sky-100'
			}`}
			on:click={() => currentTool.set(option.value)}
		>
			<svelte:component this={option.icon} className="size-5" />
		</button>
	{/each}
</div>
