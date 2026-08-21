<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import Card from './Card.svelte';
	import { weatherStore as poll } from '$lib/weatherStore.svelte';
	import { weatherCodeInfo } from '$lib/weatherCodes';
	import WeatherIcon from './icons/WeatherIcon.svelte';

	onMount(() => poll.acquire());
	onDestroy(() => poll.release());
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
				<WeatherIcon kind={info.icon} class="h-14 w-14 shrink-0 text-gray-300" />
				<div>
					<div class="font-mono text-5xl font-semibold tabular-nums">
						{Math.round(poll.data.current.temperature)}°
					</div>
					<div class="text-gray-400">
						{info.label} · feels
						<span class="font-mono tabular-nums"
							>{Math.round(poll.data.current.apparentTemperature)}°</span
						>
					</div>
				</div>
			</div>
			<div class="flex flex-1 items-end gap-3 overflow-hidden">
				{#each poll.data.daily.slice(0, 5) as day (day.date)}
					{@const dayInfo = weatherCodeInfo(day.weatherCode)}
					<div class="flex flex-1 flex-col items-center gap-1 text-center">
						<span class="font-mono text-xs tracking-wide text-gray-500 uppercase">
							{new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
						</span>
						<WeatherIcon kind={dayInfo.icon} class="mx-auto h-5 w-5 text-gray-400" />
						<span class="font-mono text-sm tabular-nums">
							<span class="font-medium">{Math.round(day.max)}°</span>
							<span class="text-gray-500">{Math.round(day.min)}°</span>
						</span>
					</div>
				{/each}
			</div>
		</div>
	{/if}
</Card>
