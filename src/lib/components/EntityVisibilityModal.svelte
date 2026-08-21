<script lang="ts">
	import { auth } from '$lib/auth.svelte';
	import { entityVisibility } from '$lib/entityVisibility.svelte';
	import { groupByRoom } from '$lib/groupByRoom';
	import { isControllableDomain } from '$lib/domains';
	import Modal from './Modal.svelte';
	import type { HaEntity } from '$lib/types';

	let { open = $bindable(false) }: { open?: boolean } = $props();

	let entities = $state<HaEntity[]>([]);
	let loading = $state(false);
	let error = $state<string | null>(null);
	let search = $state('');
	let domainFilter = $state('controllable');

	async function load() {
		loading = true;
		error = null;
		try {
			const res = await fetch('/api/ha/states', { headers: auth.authHeaders() });
			if (!res.ok) throw new Error('Failed to load devices');
			entities = await res.json();
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

	function domainCounts(): [string, number][] {
		const counts: Record<string, number> = {};
		for (const e of entities) counts[e.domain] = (counts[e.domain] ?? 0) + 1;
		return Object.entries(counts).sort((a, b) => a[0].localeCompare(b[0]));
	}

	function filtered(): HaEntity[] {
		const q = search.trim().toLowerCase();
		return entities.filter((e) => {
			if (domainFilter === 'controllable' && !isControllableDomain(e.domain)) return false;
			if (domainFilter !== 'controllable' && domainFilter !== 'all' && e.domain !== domainFilter) {
				return false;
			}
			if (q && !e.name.toLowerCase().includes(q) && !e.entity_id.toLowerCase().includes(q)) {
				return false;
			}
			return true;
		});
	}

	function close() {
		open = false;
	}
</script>

{#if open}
	<Modal title="Visible Devices" maxWidth="max-w-2xl" tall onclose={close}>
		<label class="mb-3 flex shrink-0 items-center gap-2 text-sm">
			<input
				type="checkbox"
				checked={entityVisibility.filterEnabled}
				onchange={(e) => entityVisibility.setFilterEnabled(e.currentTarget.checked)}
			/>
			Only show selected devices on the Home panel
		</label>

		{#if loading}
			<p class="text-gray-500">Loading…</p>
		{:else if error}
			<p class="text-red-400">{error}</p>
		{:else}
			{@const visibleNow = filtered()}
			<div class="mb-3 flex shrink-0 gap-2">
				<input
					type="search"
					placeholder="Search devices…"
					class="min-w-0 flex-1 rounded-lg border border-white/20 bg-black/30 px-3 py-2 text-sm"
					bind:value={search}
				/>
				<select
					class="rounded-lg border border-white/20 bg-black/30 px-2 py-2 text-sm"
					bind:value={domainFilter}
				>
					<option value="controllable">Controllable devices</option>
					<option value="all">All entities ({entities.length})</option>
					{#each domainCounts() as [domain, count] (domain)}
						<option value={domain}>{domain} ({count})</option>
					{/each}
				</select>
			</div>

			<div class="mb-3 flex shrink-0 items-center gap-3 text-sm">
				<span class="text-gray-500">{visibleNow.length} shown</span>
				<button
					type="button"
					class="underline"
					onclick={() => entityVisibility.addAll(visibleNow.map((e) => e.entity_id))}
				>
					Select shown
				</button>
				<button
					type="button"
					class="underline"
					onclick={() => entityVisibility.removeAll(visibleNow.map((e) => e.entity_id))}
				>
					Deselect shown
				</button>
				<button
					type="button"
					class="ml-auto text-gray-500 underline"
					onclick={() => entityVisibility.clearAll()}
				>
					Clear everything
				</button>
			</div>

			<div class="min-h-0 flex-1 overflow-y-auto pr-1">
				{#if visibleNow.length === 0}
					<p class="text-gray-500">No devices match.</p>
				{:else}
					{#each groupByRoom(visibleNow) as [room, roomEntities] (room)}
						<div class="mb-3">
							<h3 class="mb-1 text-xs font-medium text-gray-500 uppercase">{room}</h3>
							<div class="flex flex-col gap-0.5">
								{#each roomEntities as e (e.entity_id)}
									<label
										class="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm active:bg-white/10"
									>
										<input
											type="checkbox"
											checked={entityVisibility.visibleIds.has(e.entity_id)}
											onchange={(ev) =>
												entityVisibility.setVisible(e.entity_id, ev.currentTarget.checked)}
										/>
										<span class="truncate">{e.name}</span>
										<span class="ml-auto shrink-0 text-xs text-gray-500">{e.domain}</span>
									</label>
								{/each}
							</div>
						</div>
					{/each}
				{/if}
			</div>
		{/if}
	</Modal>
{/if}
