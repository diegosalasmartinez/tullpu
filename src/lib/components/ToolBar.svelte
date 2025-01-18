<script lang="ts">
	import ToolBarOption from '$lib/components/ToolBarOption.svelte';
	import { enablePointerEvents } from '$lib/stores/ToolStore';
</script>

<header class="absolute left-0 right-0 top-0">
	<div
		class={`mx-auto flex w-max justify-center gap-1 rounded-lg border-[1px] border-gray-200 bg-white p-1 text-sm shadow-sm ${$enablePointerEvents}`}
	>
		<ToolBarOption />
	</div>
</header>
