<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		title,
		compact = false,
		children
	}: { title: string; compact?: boolean; children: Snippet } = $props();
</script>

<section
	class="flex h-full min-h-0 w-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/5 {compact
		? 'p-3'
		: 'p-5'}"
>
	<h2
		class="font-medium tracking-wide text-gray-400 uppercase {compact
			? 'mb-1.5 text-sm'
			: 'mb-3 text-lg'}"
	>
		{title}
	</h2>
	<div class="min-h-0 flex-1 overflow-hidden">
		{@render children()}
	</div>
</section>
