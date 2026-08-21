<script lang="ts">
	import { auth } from '$lib/auth.svelte';
	import SecretEntry from './SecretEntry.svelte';
	import Modal from './Modal.svelte';

	let {
		open = $bindable(false),
		onunlocked
	}: {
		open?: boolean;
		onunlocked?: () => void;
	} = $props();

	let secret = $state('');
	let error = $state<string | null>(null);
	let retryAfterMs = $state(0);
	let busy = $state(false);

	async function submit() {
		if (!secret || busy) return;
		busy = true;
		error = null;
		const result = await auth.unlock(secret);
		busy = false;
		secret = '';
		if (result.ok) {
			open = false;
			onunlocked?.();
		} else {
			error = result.error;
			retryAfterMs = result.retryAfterMs ?? 0;
		}
	}

	function close() {
		open = false;
		secret = '';
		error = null;
	}
</script>

{#if open}
	<Modal title="Unlock Home Controls" onclose={close}>
		<SecretEntry bind:value={secret} onsubmit={submit} />
		{#if error}
			<p class="mt-3 text-sm text-red-400">
				{error}{retryAfterMs > 0 ? ` — try again in ${Math.ceil(retryAfterMs / 1000)}s` : ''}
			</p>
		{/if}
		<div class="mt-4 flex gap-2">
			<button
				type="button"
				class="flex-1 rounded-xl bg-white/10 py-3 font-medium active:bg-white/20"
				onclick={close}
			>
				Cancel
			</button>
			<button
				type="button"
				class="flex-1 rounded-xl bg-emerald-500/80 py-3 font-medium active:bg-emerald-500 disabled:opacity-50"
				disabled={busy || !secret}
				onclick={submit}
			>
				Unlock
			</button>
		</div>
	</Modal>
{/if}
