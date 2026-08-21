<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import Card from './Card.svelte';
	import { createPoll } from '$lib/poll.svelte';
	import type { ElectricPriceData } from '$lib/types';

	const poll = createPoll<ElectricPriceData>(async () => {
		const res = await fetch('/api/electric-price');
		if (!res.ok) throw new Error('Failed to load electric price');
		return res.json();
	}, 60 * 1000);

	onMount(() => poll.start());
	onDestroy(() => poll.stop());

	function tier(price: number): { label: string; color: string } {
		if (price <= 3) return { label: 'Cheap', color: '#4ade80' };
		if (price <= 8) return { label: 'Normal', color: '#facc15' };
		return { label: 'Expensive', color: '#f87171' };
	}
</script>

<Card title="Electric Price" compact>
	{#if poll.loading}
		<p class="text-gray-500">Loading…</p>
	{:else if poll.error || !poll.data}
		<p class="text-red-400">{poll.error ?? 'No data'}</p>
	{:else}
		{@const current = tier(poll.data.currentCentsPerKwh)}
		{@const max = Math.max(...poll.data.recent.map((r) => r.price), 1)}
		<div class="flex h-full flex-col gap-4">
			<div class="flex items-baseline gap-3">
				<span class="text-5xl font-semibold" style:color={current.color}>
					{poll.data.currentCentsPerKwh.toFixed(1)}¢
				</span>
				<span class="text-gray-400">/ kWh · {current.label}</span>
			</div>
			{#if poll.data.currentHourAverageCentsPerKwh !== null}
				<p class="text-sm text-gray-500">
					Hour average: {poll.data.currentHourAverageCentsPerKwh.toFixed(1)}¢
				</p>
			{/if}
			<div class="flex flex-1 items-end gap-1">
				{#each poll.data.recent as r (r.millis)}
					{@const t = tier(r.price)}
					<div
						class="flex-1 rounded-t"
						style:height="{Math.max((r.price / max) * 100, 4)}%"
						style:background={t.color}
						style:opacity="0.85"
					></div>
				{/each}
			</div>
			<p class="text-xs text-gray-500">Last {poll.data.recent.length * 5} minutes</p>
		</div>
	{/if}
</Card>
