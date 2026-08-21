<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import Card from './Card.svelte';
	import { createPoll } from '$lib/poll.svelte';
	import { auth } from '$lib/auth.svelte';
	import { entityVisibility } from '$lib/entityVisibility.svelte';
	import { groupByRoom } from '$lib/groupByRoom';
	import { isControllableDomain } from '$lib/domains';
	import { lightCapabilities } from '$lib/lightCaps';
	import { tileAccent } from '$lib/tileStyles';
	import PinEntryModal from './PinEntryModal.svelte';
	import LightModal from './LightModal.svelte';
	import VacuumModal from './VacuumModal.svelte';
	import ClimateKeypadModal from './ClimateKeypadModal.svelte';
	import LockIcon from './icons/LockIcon.svelte';
	import EntityLabel from './EntityLabel.svelte';
	import type { HaEntity } from '$lib/types';

	const poll = createPoll<HaEntity[]>(async () => {
		const res = await fetch('/api/ha/states', { headers: auth.authHeaders() });
		if (res.status === 401) {
			auth.lock();
			throw new Error('Locked');
		}
		if (!res.ok) throw new Error('Failed to load Home Assistant entities');
		return res.json();
	}, 15 * 1000);

	onMount(() => auth.refreshStatus());
	onDestroy(() => poll.stop());

	$effect(() => {
		if (auth.unlocked) {
			poll.start();
		} else {
			poll.stop();
		}
	});

	let pending = $state<Record<string, boolean>>({});
	let unlockModalOpen = $state(false);
	let lightModalId = $state<string | null>(null);
	let vacuumModalId = $state<string | null>(null);
	let climateModalId = $state<string | null>(null);

	const lightModalEntity = $derived(poll.data?.find((e) => e.entity_id === lightModalId) ?? null);
	const vacuumModalEntity = $derived(poll.data?.find((e) => e.entity_id === vacuumModalId) ?? null);
	const climateModalEntity = $derived(
		poll.data?.find((e) => e.entity_id === climateModalId) ?? null
	);

	async function callService(entityId: string, service: string, data?: Record<string, unknown>) {
		pending = { ...pending, [entityId]: true };
		try {
			const res = await fetch('/api/ha/call-service', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json', ...auth.authHeaders() },
				body: JSON.stringify({ entity_id: entityId, service, data })
			});
			if (res.status === 401) {
				auth.lock();
				throw new Error('Locked');
			}
			if (!res.ok) throw new Error('Command failed');
			await poll.refresh();
		} catch (e) {
			console.error(e);
		} finally {
			const rest = { ...pending };
			delete rest[entityId];
			pending = rest;
		}
	}

	function step(e: HaEntity, delta: number) {
		const current = Number(e.attributes.temperature ?? 70);
		callService(e.entity_id, 'set_temperature', { temperature: current + delta });
	}

	// Long-press (tap-and-hold) opens the light detail modal; a quick tap just
	// toggles. Cancel the press if the finger drags — that's a scroll, not a hold.
	const LONG_PRESS_MS = 500;
	const MOVE_CANCEL_PX = 10;

	let pressTimer: ReturnType<typeof setTimeout> | null = null;
	let pressStartX = 0;
	let pressStartY = 0;
	let longPressFired = false;

	function startLightPress(e: HaEntity, hasExtra: boolean, ev: PointerEvent) {
		longPressFired = false;
		pressStartX = ev.clientX;
		pressStartY = ev.clientY;
		if (!hasExtra) return;
		pressTimer = setTimeout(() => {
			longPressFired = true;
			lightModalId = e.entity_id;
		}, LONG_PRESS_MS);
	}

	function moveLightPress(ev: PointerEvent) {
		if (!pressTimer) return;
		const dx = ev.clientX - pressStartX;
		const dy = ev.clientY - pressStartY;
		if (Math.hypot(dx, dy) > MOVE_CANCEL_PX) cancelLightPress();
	}

	function cancelLightPress() {
		if (pressTimer) {
			clearTimeout(pressTimer);
			pressTimer = null;
		}
	}

	function endLightPress(e: HaEntity) {
		const wasLongPress = longPressFired;
		cancelLightPress();
		if (!wasLongPress) callService(e.entity_id, 'toggle');
	}
</script>

<Card title="Home">
	{#if !auth.statusLoaded}
		<p class="text-gray-500">Loading…</p>
	{:else if !auth.configured}
		<div class="flex h-full flex-col items-center justify-center gap-3 text-center text-gray-400">
			<LockIcon class="h-10 w-10" />
			<p>Set HA_CONTROL_SECRET in the server's .env file to enable Home controls.</p>
		</div>
	{:else if !auth.unlocked}
		<div class="flex h-full flex-col items-center justify-center gap-3 text-center text-gray-400">
			<LockIcon class="h-10 w-10" />
			<p>Home controls are locked.</p>
			<button
				type="button"
				class="rounded-xl bg-white/10 px-4 py-2 font-medium active:bg-white/20"
				onclick={() => (unlockModalOpen = true)}
			>
				Unlock
			</button>
		</div>
		<PinEntryModal bind:open={unlockModalOpen} />
	{:else if poll.loading}
		<p class="text-gray-500">Loading…</p>
	{:else if poll.error || !poll.data}
		<p class="text-red-400">{poll.error ?? 'No data'}</p>
	{:else if poll.data.length === 0}
		<p class="text-gray-500">No entities found</p>
	{:else}
		{@const visible = poll.data.filter((e) => entityVisibility.isVisible(e.entity_id))}
		{#if visible.length === 0}
			<p class="text-gray-500">No devices selected — choose some in Settings.</p>
		{:else}
			<div class="flex h-full flex-col gap-2 overflow-y-auto pr-1">
				{#each groupByRoom(visible) as [room, entities] (room)}
					<div>
						<h3 class="mb-1 font-mono text-xs font-bold tracking-widest text-gray-500 uppercase">
							{room}
						</h3>
						<div class="grid grid-cols-4 items-start gap-1 sm:grid-cols-5 md:grid-cols-6">
							{#each entities as e (e.entity_id)}
								{#if e.domain === 'climate'}
									<!-- svelte-ignore a11y_click_events_have_key_events -->
									<!-- svelte-ignore a11y_no_static_element_interactions -->
									<div
										class="col-span-full rounded-lg border border-white/10 bg-white/5 p-1.5"
										onclick={() => (climateModalId = e.entity_id)}
									>
										<div class="flex items-center justify-between gap-1">
											<EntityLabel domain={e.domain} name={e.name} />
											<span class="text-xs text-gray-500 uppercase">{e.state}</span>
										</div>
										<div class="mt-1 flex items-center justify-between">
											<span class="font-mono text-xs text-gray-500 tabular-nums">
												Now {e.attributes.current_temperature ?? '—'}°
											</span>
											<div class="flex items-center gap-2">
												<button
													class="h-7 w-7 rounded-full bg-white/10 text-lg active:bg-white/20"
													disabled={pending[e.entity_id]}
													onclick={(ev) => {
														ev.stopPropagation();
														step(e, -1);
													}}
												>
													−
												</button>
												<span class="w-10 text-center font-mono text-lg font-semibold tabular-nums">
													{e.attributes.temperature ?? '—'}°
												</span>
												<button
													class="h-7 w-7 rounded-full bg-white/10 text-lg active:bg-white/20"
													disabled={pending[e.entity_id]}
													onclick={(ev) => {
														ev.stopPropagation();
														step(e, 1);
													}}
												>
													+
												</button>
											</div>
										</div>
									</div>
								{:else if e.domain === 'vacuum'}
									<button
										class="min-w-0 rounded-lg border border-sky-400/30 bg-white/5 p-1 text-left active:bg-white/15"
										onclick={() => (vacuumModalId = e.entity_id)}
									>
										<EntityLabel domain={e.domain} name={e.name} />
										<span class="text-xs text-gray-500 uppercase">{e.state}</span>
									</button>
								{:else if e.domain === 'scene'}
									<button
										class="min-w-0 rounded-lg border border-white/10 bg-white/5 p-1 text-left active:bg-white/15"
										disabled={pending[e.entity_id]}
										onclick={() => callService(e.entity_id, 'turn_on')}
									>
										<EntityLabel domain={e.domain} name={e.name} />
										<span class="text-xs text-gray-500">Activate</span>
									</button>
								{:else if e.domain === 'media_player'}
									{@const active = e.state === 'playing'}
									<button
										class="min-w-0 rounded-lg border p-1 text-left transition-colors {tileAccent(
											active
										)} active:bg-white/15"
										disabled={pending[e.entity_id]}
										onclick={() => callService(e.entity_id, 'media_play_pause')}
									>
										<EntityLabel domain={e.domain} name={e.name} />
										<span class="text-xs text-gray-500 uppercase">{e.state}</span>
									</button>
								{:else if e.domain === 'lock'}
									{@const locked = e.state === 'locked'}
									<button
										class="min-w-0 rounded-lg border p-1 text-left transition-colors {tileAccent(
											!locked,
											'amber'
										)} active:bg-white/15"
										disabled={pending[e.entity_id]}
										onclick={() => callService(e.entity_id, locked ? 'unlock' : 'lock')}
									>
										<EntityLabel domain={e.domain} name={e.name} />
										<span class="text-xs text-gray-500 uppercase">{e.state}</span>
									</button>
								{:else if e.domain === 'cover'}
									{@const open = e.state === 'open'}
									<button
										class="min-w-0 rounded-lg border p-1 text-left transition-colors {tileAccent(
											open
										)} active:bg-white/15"
										disabled={pending[e.entity_id]}
										onclick={() => callService(e.entity_id, open ? 'close_cover' : 'open_cover')}
									>
										<EntityLabel domain={e.domain} name={e.name} />
										<span class="text-xs text-gray-500 uppercase">{e.state}</span>
									</button>
								{:else if e.domain === 'light'}
									{@const on = e.state === 'on'}
									{@const caps = lightCapabilities(e)}
									{@const hasExtra = caps.brightness || caps.color || caps.colorTemp}
									<button
										type="button"
										class="min-w-0 rounded-lg border p-1 text-left {hasExtra
											? on
												? 'border-sky-400/50 bg-white/5'
												: 'border-sky-400/30 bg-white/5'
											: tileAccent(on)} active:opacity-80"
										disabled={pending[e.entity_id]}
										onpointerdown={(ev) => startLightPress(e, hasExtra, ev)}
										onpointermove={moveLightPress}
										onpointerup={() => endLightPress(e)}
										onpointercancel={cancelLightPress}
										onpointerleave={cancelLightPress}
									>
										<EntityLabel domain={e.domain} name={e.name} />
										<span class="text-xs text-gray-500 uppercase">{e.state}</span>
									</button>
								{:else if isControllableDomain(e.domain)}
									{@const on = e.state === 'on'}
									<button
										class="min-w-0 rounded-lg border p-1 text-left transition-colors {tileAccent(
											on
										)} active:bg-white/15"
										disabled={pending[e.entity_id]}
										onclick={() => callService(e.entity_id, 'toggle')}
									>
										<EntityLabel domain={e.domain} name={e.name} />
										<span class="text-xs text-gray-500 uppercase">{e.state}</span>
									</button>
								{:else}
									{@const unit = e.attributes.unit_of_measurement}
									<div class="min-w-0 rounded-lg border border-dashed border-white/15 p-1">
										<EntityLabel domain={e.domain} name={e.name} dim />
										<span class="text-xs text-gray-500">
											{e.state}{unit ? ` ${unit}` : ''}
										</span>
									</div>
								{/if}
							{/each}
						</div>
					</div>
				{/each}
			</div>
		{/if}
	{/if}

	{#if lightModalEntity}
		<LightModal
			entity={lightModalEntity}
			{pending}
			{callService}
			onclose={() => (lightModalId = null)}
		/>
	{/if}
	{#if vacuumModalEntity}
		<VacuumModal
			entity={vacuumModalEntity}
			{pending}
			{callService}
			onclose={() => (vacuumModalId = null)}
		/>
	{/if}
	{#if climateModalEntity}
		<ClimateKeypadModal
			entity={climateModalEntity}
			{pending}
			{callService}
			onclose={() => (climateModalId = null)}
		/>
	{/if}
</Card>
