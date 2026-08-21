<script lang="ts">
	import type { WeatherIconKind } from '$lib/weatherCodes';

	let { kind, class: className = '' }: { kind: WeatherIconKind; class?: string } = $props();
</script>

<svg
	class={className}
	viewBox="0 0 24 24"
	fill="none"
	stroke="currentColor"
	stroke-width="1.75"
	stroke-linecap="round"
	stroke-linejoin="round"
	aria-hidden="true"
>
	{#if kind === 'sun'}
		<circle cx="12" cy="12" r="4.5" />
		<path
			d="M12 2.5v2.5M12 19v2.5M4.6 4.6l1.8 1.8M17.6 17.6l1.8 1.8M2.5 12h2.5M19 12h2.5M4.6 19.4l1.8-1.8M17.6 6.4l1.8-1.8"
		/>
	{:else if kind === 'cloud-sun'}
		<circle cx="7.5" cy="7.5" r="2.8" />
		<path d="M7.5 3v1.4M7.5 12v-1.4M3.1 7.5h1.4M12 7.5h-1.4M4.2 4.2l1 1M10.8 4.2l-1 1" />
		<path d="M9.5 19.5h7.5a3.3 3.3 0 0 0 .3-6.58A4.7 4.7 0 0 0 8.2 12.5" />
	{:else if kind === 'cloud'}
		<path d="M6.5 19a4 4 0 1 1 .6-7.96A5 5 0 0 1 17 13a3.5 3.5 0 0 1-.5 6H6.5Z" />
	{:else if kind === 'fog'}
		<path d="M6.5 15a4 4 0 1 1 .6-7.96A5 5 0 0 1 17 9" />
		<path d="M4 17.5h16M6 20.5h12" />
	{:else if kind === 'rain'}
		<path d="M6.5 13a4 4 0 1 1 .6-7.96A5 5 0 0 1 17 7a3.5 3.5 0 0 1-.5 6H6.5Z" />
		<path d="M8 17.5 7 20M12 17.5l-1 2.5M16 17.5l-1 2.5" />
	{:else if kind === 'snow'}
		<path d="M6.5 12a4 4 0 1 1 .6-7.96A5 5 0 0 1 17 6a3.5 3.5 0 0 1-.5 6H6.5Z" />
		<path d="M8 17v4M6 18.5l4 1M10 18.5l-4 1M16 17v4M14 18.5l4 1M18 18.5l-4 1" />
	{:else if kind === 'storm'}
		<path d="M6.5 12a4 4 0 1 1 .6-7.96A5 5 0 0 1 17 6a3.5 3.5 0 0 1-.5 6H6.5Z" />
		<path d="M13 14.5 10 19h3l-2 4.5" />
	{/if}
</svg>
