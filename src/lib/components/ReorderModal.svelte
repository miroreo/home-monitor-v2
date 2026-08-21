<script lang="ts">
	import { auth } from '$lib/auth.svelte';
	import { entityVisibility } from '$lib/entityVisibility.svelte';
	import { groupByRoom } from '$lib/groupByRoom';
	import { layoutOrder } from '$lib/layoutOrder.svelte';
	import Modal from './Modal.svelte';
	import MoveButtons from './MoveButtons.svelte';
	import type { HaEntity } from '$lib/types';

	let { open = $bindable(false) }: { open?: boolean } = $props();

	let loading = $state(false);
	let error = $state<string | null>(null);
	let nameById = $state<Record<string, string>>({});

	// Working copy: [room, entityIds[]][], seeded from the current effective
	// order (custom order if set, else the default priority/alphabetical one).
	let layout = $state<[string, string[]][]>([]);

	async function load() {
		loading = true;
		error = null;
		try {
			const res = await fetch('/api/ha/states', { headers: auth.authHeaders() });
			if (!res.ok) throw new Error('Failed to load devices');
			const entities = (await res.json()) as HaEntity[];
			const visible = entities.filter((e) => entityVisibility.isVisible(e.entity_id));
			layout = groupByRoom(visible).map(([room, es]) => [room, es.map((e) => e.entity_id)]);
			nameById = Object.fromEntries(entities.map((e) => [e.entity_id, e.name]));
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to load devices';
		} finally {
			loading = false;
		}
	}

	$effect(() => {
		if (open && auth.unlocked) {
			load();
		}
	});

	function commit() {
		layoutOrder.setRoomOrder(layout.map(([room]) => room));
		layoutOrder.setEntityOrder(layout.flatMap(([, ids]) => ids));
	}

	function moveRoom(index: number, delta: number) {
		const target = index + delta;
		if (target < 0 || target >= layout.length) return;
		[layout[index], layout[target]] = [layout[target], layout[index]];
		commit();
	}

	function moveEntity(roomIndex: number, entityIndex: number, delta: number) {
		const ids = layout[roomIndex][1];
		const target = entityIndex + delta;
		if (target < 0 || target >= ids.length) return;
		[ids[entityIndex], ids[target]] = [ids[target], ids[entityIndex]];
		commit();
	}

	function resetOrder() {
		layoutOrder.reset();
		load();
	}

	function close() {
		open = false;
	}
</script>

{#if open}
	<Modal title="Reorder Home Panel" maxWidth="max-w-lg" tall onclose={close}>
		{#if loading}
			<p class="text-gray-500">Loading…</p>
		{:else if error}
			<p class="text-red-400">{error}</p>
		{:else if layout.length === 0}
			<p class="text-gray-500">No visible devices to reorder — choose some first.</p>
		{:else}
			<div class="min-h-0 flex-1 overflow-y-auto pr-1">
				{#each layout as [room, entityIds], roomIndex (room)}
					<div class="mb-3 rounded-lg border border-white/10 bg-white/5 p-2">
						<div class="mb-1 flex items-center justify-between">
							<h3 class="text-xs font-medium text-gray-400 uppercase">{room}</h3>
							<MoveButtons
								disabledUp={roomIndex === 0}
								disabledDown={roomIndex === layout.length - 1}
								onup={() => moveRoom(roomIndex, -1)}
								ondown={() => moveRoom(roomIndex, 1)}
								label="room"
							/>
						</div>
						<div class="flex flex-col gap-0.5">
							{#each entityIds as entityId, entityIndex (entityId)}
								<div class="flex items-center gap-2 rounded-lg px-2 py-1 text-sm">
									<span class="min-w-0 flex-1 truncate">
										{nameById[entityId] ?? entityId}
									</span>
									<MoveButtons
										disabledUp={entityIndex === 0}
										disabledDown={entityIndex === entityIds.length - 1}
										onup={() => moveEntity(roomIndex, entityIndex, -1)}
										ondown={() => moveEntity(roomIndex, entityIndex, 1)}
										label="device"
									/>
								</div>
							{/each}
						</div>
					</div>
				{/each}
			</div>
			<button
				type="button"
				class="mt-3 shrink-0 self-start text-sm text-gray-500 underline"
				onclick={resetOrder}
			>
				Reset to default order
			</button>
		{/if}
	</Modal>
{/if}
