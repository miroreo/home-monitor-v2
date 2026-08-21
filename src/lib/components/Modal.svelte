<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		title,
		maxWidth = 'max-w-sm',
		tall = false,
		onclose,
		children
	}: {
		title: string;
		maxWidth?: string;
		tall?: boolean;
		onclose: () => void;
		children: Snippet;
	} = $props();
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
	onclick={(ev) => {
		if (ev.target === ev.currentTarget) onclose();
	}}
>
	<div
		class="w-full {maxWidth} rounded-2xl border border-white/10 bg-gray-900 p-6 {tall
			? 'flex h-[90vh] flex-col'
			: 'max-h-[90vh] overflow-y-auto'}"
	>
		<div class="mb-4 flex items-center justify-between {tall ? 'shrink-0' : ''}">
			<h2 class="truncate text-lg font-semibold">{title}</h2>
			<button type="button" class="text-xl text-gray-400" onclick={onclose} aria-label="Close">
				✕
			</button>
		</div>
		{@render children()}
	</div>
</div>
