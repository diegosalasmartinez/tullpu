<script lang="ts">
	import { appState } from '$lib/state.svelte';
	import type { Page } from '$lib/types';

	function addPage() {
		const id = crypto.randomUUID();
		const newPage: Page = {
			id,
			name: `Page ${appState.pages.length + 1}`,
			shapes: []
		};
		appState.pages.push(newPage);
		appState.activePageId = id;
		localStorage.setItem('pages', JSON.stringify(appState.pages));
		localStorage.setItem('activePageId', id);
	}

	function switchPage(id: string) {
		appState.activePageId = id;
		localStorage.setItem('activePageId', id);
	}
</script>

<div class="page-tabs">
	{#each appState.pages as page}
		<button
			class="tab"
			class:active={page.id === appState.activePageId}
			onclick={() => switchPage(page.id)}
		>
			{page.name}
		</button>
	{/each}
	<button class="tab add-tab" onclick={addPage}>+</button>
</div>

<style lang="postcss">
	.page-tabs {
		@apply fixed bottom-0 left-0 flex h-8 w-full items-center gap-1 bg-white px-2 shadow-md;
	}

	.tab {
		@apply cursor-pointer rounded-t px-3 py-1 text-sm;
	}

	.tab.active {
		@apply bg-blue-500 text-white;
	}

	.add-tab {
		@apply font-bold;
	}
</style>
