<script lang="ts">
	let { className = '' }: { className?: string } = $props();
</script>

<svg
	aria-hidden="true"
	focusable="false"
	role="img"
	viewBox="0 0 24 24"
	class={className}
	fill="none"
	stroke-width="2"
	stroke="currentColor"
	stroke-linecap="round"
	stroke-linejoin="round"
>
	<g stroke-width="1.5">
		<path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
		<circle cx="12" cy="12" r="8"></circle>
	</g>
</svg>
