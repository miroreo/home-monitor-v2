<script lang="ts">
	import type { HaEntity } from '$lib/types';
	import Modal from './Modal.svelte';

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

	const cleaning = $derived(entity.state === 'cleaning');
</script>

<Modal title={entity.name} {onclose}>
	<p class="mb-4 text-sm text-gray-500 uppercase">{entity.state}</p>

	<div class="flex gap-2">
		<button
			class="flex-1 rounded-xl bg-white/10 py-3 font-medium active:bg-white/20"
			disabled={pending[entity.entity_id]}
			onclick={() => callService(entity.entity_id, cleaning ? 'pause' : 'start')}
		>
			{cleaning ? 'Pause' : 'Start'}
		</button>
		<button
			class="flex-1 rounded-xl bg-white/10 py-3 font-medium active:bg-white/20"
			disabled={pending[entity.entity_id]}
			onclick={() => callService(entity.entity_id, 'return_to_base')}
		>
			Dock
		</button>
	</div>
</Modal>
