<script lang="ts">
	let { domain, class: className = '' }: { domain: string; class?: string } = $props();
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
	{#if domain === 'light'}
		<path d="M9 18h6" />
		<path d="M10 22h4" />
		<path d="M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.3h6c0-1 .4-1.8 1-2.3A7 7 0 0 0 12 2Z" />
	{:else if domain === 'switch' || domain === 'input_boolean'}
		<rect x="2" y="7" width="20" height="10" rx="5" />
		<circle cx="16" cy="12" r="3" fill="currentColor" stroke="none" />
	{:else if domain === 'climate'}
		<path d="M14 4a2 2 0 0 0-4 0v10.5a4 4 0 1 0 4 0Z" />
		<path d="M12 12V8" />
	{:else if domain === 'fan'}
		<path d="M12 12C12 8 14 5 17 6C19 7 18 10 12 12Z" />
		<path d="M12 12C8 12 5 10 6 7C7 5 10 6 12 12Z" />
		<path d="M12 12C12 16 10 19 7 18C5 17 6 14 12 12Z" />
		<path d="M12 12C16 12 19 14 18 17C17 19 14 18 12 12Z" />
		<circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
	{:else if domain === 'lock'}
		<rect x="4" y="11" width="16" height="10" rx="2" />
		<path d="M8 11V7a4 4 0 0 1 8 0v4" />
	{:else if domain === 'cover'}
		<rect x="3" y="3" width="18" height="18" rx="1" />
		<path d="M3 9h18M3 14h18" />
	{:else if domain === 'scene'}
		<path
			d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8"
		/>
	{:else if domain === 'media_player'}
		<circle cx="12" cy="12" r="9" />
		<path d="M10 8.5v7l6-3.5Z" fill="currentColor" stroke="none" />
	{:else if domain === 'vacuum'}
		<circle cx="12" cy="12" r="8" />
		<circle cx="12" cy="12" r="2" fill="currentColor" stroke="none" />
		<path d="M12 4v2M12 18v2M4 12h2M18 12h2" />
	{:else if domain === 'automation'}
		<path d="M5 4v6a4 4 0 0 0 4 4h6" />
		<path d="M12 11l3 3-3 3" />
		<circle cx="5" cy="4" r="2" fill="currentColor" stroke="none" />
	{:else if domain === 'sensor'}
		<path d="M3 12h4l2-7 4 14 2-7h6" />
	{:else if domain === 'binary_sensor'}
		<circle cx="12" cy="12" r="5" fill="currentColor" stroke="none" />
	{:else if domain === 'update'}
		<path d="M21 12a9 9 0 1 1-3-6.7" />
		<path d="M21 3v6h-6" />
	{:else if domain === 'button'}
		<rect x="5" y="5" width="14" height="14" rx="3" />
		<circle cx="12" cy="12" r="2" fill="currentColor" stroke="none" />
	{:else if domain === 'camera'}
		<path d="M4 8h3l2-2h6l2 2h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z" />
		<circle cx="12" cy="13" r="3.5" />
	{:else if domain === 'weather'}
		<path d="M7 18a4 4 0 1 1 .6-7.96A5 5 0 0 1 17 12a3.5 3.5 0 0 1-.5 6.98H7Z" />
	{:else if domain === 'sun'}
		<circle cx="12" cy="12" r="4" />
		<path
			d="M12 3v2M12 19v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M3 12h2M19 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"
		/>
	{:else if domain === 'person'}
		<circle cx="12" cy="8" r="3.5" />
		<path d="M5 20c0-3.5 3-6 7-6s7 2.5 7 6" />
	{:else if domain === 'device_tracker'}
		<path d="M12 21s7-6.5 7-11.5A7 7 0 0 0 5 9.5C5 14.5 12 21 12 21Z" />
		<circle cx="12" cy="9.5" r="2.2" />
	{:else}
		<circle cx="12" cy="12" r="9" />
		<path d="M12 8h.01" />
		<path d="M11 12h1v4h1" />
	{/if}
</svg>
