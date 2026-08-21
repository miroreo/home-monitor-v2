<script lang="ts">
	import { onDestroy, onMount } from 'svelte';

	let now = $state(new Date());
	let timer: ReturnType<typeof setInterval> | undefined;

	onMount(() => {
		timer = setInterval(() => {
			now = new Date();
		}, 1000);
	});
	onDestroy(() => {
		if (timer) clearInterval(timer);
	});

	let time = $derived(
		now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit' })
	);
	let date = $derived(
		now.toLocaleDateString('en-US', {
			weekday: 'long',
			month: 'long',
			day: 'numeric'
		})
	);
</script>

<div class="flex items-baseline gap-4">
	<span class="text-6xl font-semibold tabular-nums">{time}</span>
	<span class="text-2xl text-gray-400">{date}</span>
</div>
