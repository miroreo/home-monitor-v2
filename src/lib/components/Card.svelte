<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		title,
		compact = false,
		children
	}: { title: string; compact?: boolean; children: Snippet } = $props();
</script>

<section
	class="flex h-full min-h-0 w-full flex-col overflow-hidden border-t-2 border-white/10 {compact
		? 'pt-2'
		: 'pt-3'}"
>
	<h2 class="mb-2 font-mono text-xs font-bold tracking-widest text-gray-400 uppercase">
		{title}
	</h2>
	<div class="min-h-0 flex-1 overflow-hidden">
		{@render children()}
	</div>
</section>
