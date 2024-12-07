<script lang="ts">
	import { type ToolBarOptions } from '$lib/types';
	import ToolBarOption from '$lib/components/ToolBarOption.svelte';

	export let setTool: (tool: ToolBarOptions) => void;

	let currentTool: ToolBarOptions = 'selection';

	const handleClickTool = (tool: ToolBarOptions) => {
		setTool(tool);
		currentTool = tool;
	};
</script>

<header class="toolbar absolute left-0 right-0 top-4 z-50 w-full">
	<ToolBarOption {handleClickTool} {currentTool} />
</header>
