<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { weatherStore } from '$lib/weatherStore.svelte';
	import WeatherIcon from './icons/WeatherIcon.svelte';
	import type { WeatherIconKind } from '$lib/weatherCodes';

	onMount(() => weatherStore.acquire());
	onDestroy(() => weatherStore.release());

	const STORM_CODES = new Set([95, 96, 99]);
	type Severity = 'clear' | 'notice' | 'advisory';

	const COLORS: Record<Severity, string> = {
		clear: '#9aa0a8',
		notice: '#facc15',
		advisory: '#f87171'
	};

	const LABELS: Record<Severity, string> = {
		clear: 'Leaving soon',
		notice: 'Notice',
		advisory: 'Advisory'
	};

	let status = $derived.by(
		(): { message: string; icon: WeatherIconKind; severity: Severity } | null => {
			const data = weatherStore.data;
			if (!data) return null;

			const next = data.hourly.slice(0, 2);
			if (next.length === 0) return null;
			const maxPrecipProbability = Math.max(...next.map((h) => h.precipitationProbability));
			const minTemp = Math.min(...next.map((h) => h.temperature));
			const maxTemp = Math.max(...next.map((h) => h.temperature));

			if (STORM_CODES.has(data.current.weatherCode)) {
				return {
					message: 'Thunderstorms nearby — consider delaying travel',
					icon: 'storm',
					severity: 'advisory'
				};
			}
			if (minTemp <= 32) {
				return { message: 'Freezing outside — bundle up', icon: 'snow', severity: 'advisory' };
			}
			if (maxPrecipProbability >= 50) {
				return { message: 'Rain likely — bring an umbrella', icon: 'rain', severity: 'notice' };
			}
			if (maxTemp >= 90) {
				return { message: 'Heat advisory — bring water', icon: 'sun', severity: 'notice' };
			}
			if (minTemp <= 45) {
				return { message: 'Chilly — grab a jacket', icon: 'cloud', severity: 'notice' };
			}
			return {
				message: `Clear conditions, ${Math.round(data.current.temperature)}°`,
				icon: 'sun',
				severity: 'clear'
			};
		}
	);
</script>

{#if status}
	<div class="flex items-center justify-end gap-3" style:color={COLORS[status.severity]}>
		<div class="text-right leading-tight">
			<div class="font-mono text-xs font-bold tracking-widest uppercase opacity-80">
				{LABELS[status.severity]}
			</div>
			<div class="font-mono text-base">{status.message}</div>
		</div>
		<WeatherIcon kind={status.icon} class="h-7 w-7 shrink-0" />
	</div>
{/if}
