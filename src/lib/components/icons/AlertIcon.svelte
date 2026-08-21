<script lang="ts">
	let { class: className = '' }: { class?: string } = $props();
</script>

<svg
	class={className}
	viewBox="0 0 24 24"
	fill="none"
	stroke="currentColor"
	stroke-width="2"
	stroke-linecap="round"
	stroke-linejoin="round"
	aria-hidden="true"
>
	<path d="M12 3 2 20h20L12 3Z" />
	<path d="M12 10v4" />
	<circle cx="12" cy="17" r="1" fill="currentColor" stroke="none" />
</svg>
