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
	<g transform="rotate(45 12 12)">
		<path d="M2 8.5a14 14 0 0 1 20 0" />
		<path d="M5.5 12.5a9 9 0 0 1 13 0" />
		<path d="M9 16.5a4 4 0 0 1 6 0" />
		<circle cx="12" cy="20" r="1" fill="currentColor" stroke="none" />
	</g>
</svg>
