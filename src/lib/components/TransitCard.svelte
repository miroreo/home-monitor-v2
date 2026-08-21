<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import Card from './Card.svelte';
	import Modal from './Modal.svelte';
	import { createPoll } from '$lib/poll.svelte';
	import { trainLineStyle } from '$lib/ctaLineColors';
	import ClockIcon from './icons/ClockIcon.svelte';
	import SignalIcon from './icons/SignalIcon.svelte';
	import AlertIcon from './icons/AlertIcon.svelte';
	import type { RailAlert, RailAlertLine, TransitData } from '$lib/types';

	const poll = createPoll<TransitData>(async () => {
		const res = await fetch('/api/transit');
		if (!res.ok) throw new Error('Failed to load transit data');
		return res.json();
	}, 30 * 1000);

	onMount(() => poll.start());
	onDestroy(() => poll.stop());

	let alertsOpen = $state(false);
	let stationModal = $state<{ kind: 'bus' | 'train'; id: string; name: string } | null>(null);

	function fmt(m: number | 'DUE' | 'ARR'): string {
		return m === 'DUE' || m === 'ARR' ? m : `${m} min`;
	}

	function sortValue(m: number | 'DUE' | 'ARR'): number {
		return m === 'DUE' || m === 'ARR' ? 0 : m;
	}

	interface TransitRow {
		kind: 'bus' | 'train';
		key: string;
		label: string;
		destination: string;
		minutesAway: number | 'DUE' | 'ARR';
		lineStyle: { bg: string; text: string };
		isScheduled?: boolean;
		locationId: string;
		locationName: string;
	}

	// CTA's own official bus-route badge color, taken directly from their
	// alerts API ("ServiceBackColor" on Bus Route service entries).
	const BUS_STYLE = { bg: '#565a5c', text: '#ffffff' };

	function combinedRows(data: TransitData): TransitRow[] {
		const busRows: TransitRow[] = data.buses.map((b, i) => ({
			kind: 'bus',
			key: `bus-${b.stopId}-${b.route}-${b.destination}-${i}`,
			label: b.route,
			destination: b.destination,
			minutesAway: b.minutesAway,
			lineStyle: BUS_STYLE,
			locationId: b.stopId,
			locationName: b.stopName
		}));
		const trainRows: TransitRow[] = data.trains.map((t, i) => ({
			kind: 'train',
			key: `train-${t.stationId}-${t.line}-${t.destination}-${i}`,
			label: t.line,
			destination: t.destination,
			minutesAway: t.minutesAway,
			lineStyle: trainLineStyle(t.line, t.destination),
			isScheduled: t.isScheduled,
			locationId: t.stationId,
			locationName: t.stationName
		}));
		return [...busRows, ...trainRows].sort(
			(a, b) => sortValue(a.minutesAway) - sortValue(b.minutesAway)
		);
	}

	// Every prediction at the tapped row's station/stop, not just the up-to-10
	// shown in the combined list — this is what the modal shows.
	const stationRows = $derived.by(() => {
		if (!stationModal || !poll.data) return [];
		return combinedRows(poll.data).filter(
			(r) => r.kind === stationModal!.kind && r.locationId === stationModal!.id
		);
	});

	function uniqueLines(alerts: RailAlert[]): RailAlertLine[] {
		const seen: Record<string, RailAlertLine> = {};
		for (const a of alerts) {
			for (const l of a.lines) {
				seen[l.id] ??= l;
			}
		}
		return Object.values(seen);
	}
</script>

{#snippet transitRow(row: TransitRow)}
	<div
		class="flex items-center justify-between gap-2 px-2 py-1"
		style:background-color={row.lineStyle.bg}
		style:color={row.lineStyle.text}
	>
		<span
			class="flex min-w-0 items-baseline gap-1 truncate opacity-90"
			class:italic={row.isScheduled}
		>
			{#if row.kind === 'bus'}
				<span class="shrink-0 font-semibold not-italic opacity-100">{row.label}</span>
			{/if}
			<span class="truncate">{row.destination}</span>
		</span>
		<span class="flex shrink-0 items-center gap-1.5">
			<span class="tabular-nums">{fmt(row.minutesAway)}</span>
			{#if row.isScheduled}
				<ClockIcon class="h-4 w-4 shrink-0" />
			{:else}
				<SignalIcon class="h-4 w-4 shrink-0" />
			{/if}
		</span>
	</div>
{/snippet}

<Card title="Transit">
	{#if poll.loading}
		<p class="text-gray-500">Loading…</p>
	{:else if poll.error || !poll.data}
		<p class="text-red-400">{poll.error ?? 'No data'}</p>
	{:else}
		<div class="flex h-full flex-col gap-2">
			{#if poll.data.buses.length === 0 && poll.data.trains.length === 0}
				<p class="text-gray-500">No predictions</p>
			{:else}
				<div class="min-h-0 flex-1 overflow-y-auto text-lg">
					{#each combinedRows(poll.data).slice(0, 10) as row (row.key)}
						<button
							type="button"
							class="w-full appearance-none border-0 bg-transparent p-0 text-left active:opacity-70"
							onclick={() =>
								(stationModal = { kind: row.kind, id: row.locationId, name: row.locationName })}
						>
							{@render transitRow(row)}
						</button>
					{/each}
				</div>
			{/if}

			{#if poll.data.railAlerts.length > 0}
				<button
					type="button"
					class="flex shrink-0 items-center gap-1.5 self-start rounded-lg bg-amber-400/10 px-2 py-1 text-amber-400 active:bg-amber-400/20"
					onclick={() => (alertsOpen = true)}
				>
					<AlertIcon class="h-4 w-4 shrink-0" />
					<span class="text-sm">{poll.data.railAlerts.length}</span>
					{#each uniqueLines(poll.data.railAlerts) as line (line.id)}
						<span class="h-5 w-5 shrink-0 rounded-full" style:background-color={line.bg}></span>
					{/each}
				</button>
			{:else}
				<span class="flex shrink-0 items-center gap-1.5 self-start px-2 py-1 text-sm text-gray-500">
					<AlertIcon class="h-4 w-4 shrink-0 opacity-50" />
					No service alerts
				</span>
			{/if}
		</div>
	{/if}
</Card>

{#if alertsOpen && poll.data}
	<Modal title="Rail Alerts" maxWidth="max-w-lg" onclose={() => (alertsOpen = false)}>
		<div class="flex flex-col gap-3">
			{#each poll.data.railAlerts as alert (alert.id)}
				<div class="rounded-lg border border-white/10 bg-white/5 p-3">
					<div class="mb-1 flex flex-wrap gap-1">
						{#each alert.lines as line (line.id)}
							<span
								class="rounded px-1.5 py-0.5 text-xs font-bold"
								style:background-color={line.bg}
								style:color={line.text}
							>
								{line.name}
							</span>
						{/each}
					</div>
					<p class="text-sm font-medium">{alert.headline}</p>
					<p class="mt-1 text-xs text-gray-400">{alert.description}</p>
				</div>
			{/each}
		</div>
	</Modal>
{/if}

{#if stationModal}
	<Modal title={stationModal.name} maxWidth="max-w-md" onclose={() => (stationModal = null)}>
		{#if stationRows.length === 0}
			<p class="text-gray-500">No predictions</p>
		{:else}
			<div class="flex flex-col gap-2 text-lg">
				{#each stationRows as row (row.key)}
					{@render transitRow(row)}
				{/each}
			</div>
		{/if}
	</Modal>
{/if}
