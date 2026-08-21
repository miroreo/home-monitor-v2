<script lang="ts">
	import RefreshIcon from './icons/RefreshIcon.svelte';
</script>

<button
	type="button"
	class="fixed top-4 right-[5.25rem] z-40 rounded-full bg-white/10 p-4 text-gray-300 active:bg-white/20"
	onclick={() => location.reload()}
	aria-label="Refresh"
>
	<RefreshIcon class="h-7 w-7" />
</button>
