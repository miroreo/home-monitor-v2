<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import Card from './Card.svelte';
	import { createPoll } from '$lib/poll.svelte';
	import { weatherCodeInfo } from '$lib/weatherCodes';
	import type { WeatherData } from '$lib/types';

	const poll = createPoll<WeatherData>(
		async () => {
			const res = await fetch('/api/weather');
			if (!res.ok) throw new Error('Failed to load weather');
			return res.json();
		},
		10 * 60 * 1000
	);

	onMount(() => poll.start());
	onDestroy(() => poll.stop());
</script>

<Card title="Weather" compact>
	{#if poll.loading}
		<p class="text-gray-500">Loading…</p>
	{:else if poll.error || !poll.data}
		<p class="text-red-400">{poll.error ?? 'No data'}</p>
	{:else}
		{@const info = weatherCodeInfo(poll.data.current.weatherCode)}
		<div class="flex h-full flex-col gap-4">
			<div class="flex items-center gap-4">
				<span class="text-6xl">{info.icon}</span>
				<div>
					<div class="text-5xl font-semibold">{Math.round(poll.data.current.temperature)}°</div>
					<div class="text-gray-400">
						{info.label} · feels {Math.round(poll.data.current.apparentTemperature)}°
					</div>
				</div>
			</div>
			<div class="flex flex-1 items-end gap-3 overflow-hidden">
				{#each poll.data.daily.slice(0, 5) as day (day.date)}
					{@const dayInfo = weatherCodeInfo(day.weatherCode)}
					<div class="flex flex-1 flex-col items-center gap-1 text-center">
						<span class="text-xs text-gray-500">
							{new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
						</span>
						<span class="text-2xl">{dayInfo.icon}</span>
						<span class="text-sm">
							<span class="font-medium">{Math.round(day.max)}°</span>
							<span class="text-gray-500">{Math.round(day.min)}°</span>
						</span>
					</div>
				{/each}
			</div>
		</div>
	{/if}
</Card>
