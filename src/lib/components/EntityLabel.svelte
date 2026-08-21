<script lang="ts">
	import EntityIcon from './icons/EntityIcon.svelte';

	let {
		domain,
		name,
		dim = false
	}: {
		domain: string;
		name: string;
		dim?: boolean;
	} = $props();
</script>

<span class="flex min-w-0 items-center gap-1">
	<EntityIcon {domain} class="h-3.5 w-3.5 shrink-0 opacity-70" />
	<span class="truncate text-sm {dim ? 'text-gray-300' : 'font-medium'}">{name}</span>
</span>
