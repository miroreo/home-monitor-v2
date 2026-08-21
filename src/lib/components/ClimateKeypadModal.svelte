<script lang="ts">
	import type { HaEntity } from '$lib/types';
	import Modal from './Modal.svelte';
	import PinPad from './PinPad.svelte';

	let {
		entity,
		pending,
		callService,
		onclose
	}: {
		entity: HaEntity;
		pending: Record<string, boolean>;
		callService: (entityId: string, service: string, data?: Record<string, unknown>) => void;
		onclose: () => void;
	} = $props();

	let value = $state('');

	function onkey(k: string) {
		if (value.length >= 3) return;
		value += k;
	}

	function onbackspace() {
		value = value.slice(0, -1);
	}

	function submit() {
		if (!value) return;
		const parsed = Number(value);
		if (Number.isNaN(parsed)) return;
		const min = Number(entity.attributes.min_temp ?? -Infinity);
		const max = Number(entity.attributes.max_temp ?? Infinity);
		const temperature = Math.min(Math.max(parsed, min), max);
		callService(entity.entity_id, 'set_temperature', { temperature });
		onclose();
	}
</script>

<Modal title="Set Temperature" {onclose}>
	<p class="mb-1 truncate text-sm text-gray-400">{entity.name}</p>
	<p class="mb-4 text-xs text-gray-500">
		Current target: {entity.attributes.temperature ?? '—'}°
	</p>

	<div class="mb-4 text-center">
		<span class="font-mono text-5xl font-semibold tabular-nums">{value || '—'}</span>
		<span class="text-3xl text-gray-500">°</span>
	</div>

	<PinPad {onkey} {onbackspace} />

	<button
		type="button"
		class="mt-3 w-full rounded-xl bg-emerald-500/80 py-3 font-medium active:bg-emerald-500 disabled:opacity-50"
		disabled={!value || pending[entity.entity_id]}
		onclick={submit}
	>
		Set
	</button>
</Modal>
