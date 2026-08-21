<script lang="ts">
	import { auth } from '$lib/auth.svelte';
	import SecretEntry from './SecretEntry.svelte';
	import EntityVisibilityModal from './EntityVisibilityModal.svelte';
	import ReorderModal from './ReorderModal.svelte';
	import Modal from './Modal.svelte';

	let { open = $bindable(false) }: { open?: boolean } = $props();

	let secret = $state('');
	let error = $state<string | null>(null);
	let retryAfterMs = $state(0);
	let busy = $state(false);
	let visibilityModalOpen = $state(false);
	let reorderModalOpen = $state(false);

	async function submitUnlock() {
		if (!secret || busy) return;
		busy = true;
		error = null;
		const result = await auth.unlock(secret);
		busy = false;
		secret = '';
		if (!result.ok) {
			error = result.error;
			retryAfterMs = result.retryAfterMs ?? 0;
		}
	}

	function close() {
		open = false;
		error = null;
		secret = '';
	}
</script>

{#if open}
	<Modal title="Settings" maxWidth="max-w-md" onclose={close}>
		<section>
			<h3 class="mb-2 text-sm text-gray-500">Home Control Access</h3>

			{#if !auth.configured}
				<p class="text-sm text-gray-400">
					No PIN/PSK is configured. Set <code class="text-gray-300">HA_CONTROL_SECRET</code> in the
					server's <code class="text-gray-300">.env</code> file to enable Home controls.
				</p>
			{:else if auth.unlocked}
				<p class="mb-4 text-sm text-gray-400">Home controls are currently unlocked.</p>
				<button
					type="button"
					class="w-full rounded-xl bg-white/10 py-3 font-medium active:bg-white/20"
					onclick={() => auth.lock()}
				>
					Lock Home Controls Now
				</button>
			{:else}
				<p class="mb-3 text-sm text-gray-400">Enter the PIN or PSK to unlock Home controls.</p>
				<SecretEntry bind:value={secret} onsubmit={submitUnlock} />

				<div class="mt-4 mb-3 flex items-center gap-3 text-sm">
					<span class="text-gray-500">On-screen input:</span>
					<button
						type="button"
						class="underline"
						class:opacity-50={auth.keypadStyle !== 'numeric'}
						onclick={() => auth.setKeypadStyle('numeric')}
					>
						Numeric keypad
					</button>
					<button
						type="button"
						class="underline"
						class:opacity-50={auth.keypadStyle !== 'alphanumeric'}
						onclick={() => auth.setKeypadStyle('alphanumeric')}
					>
						Full keyboard
					</button>
				</div>

				{#if error}
					<p class="mb-3 text-sm text-red-400">
						{error}{retryAfterMs > 0 ? ` — try again in ${Math.ceil(retryAfterMs / 1000)}s` : ''}
					</p>
				{/if}

				<button
					type="button"
					class="w-full rounded-xl bg-emerald-500/80 py-3 font-medium active:bg-emerald-500 disabled:opacity-50"
					disabled={busy || !secret}
					onclick={submitUnlock}
				>
					Unlock
				</button>
			{/if}
		</section>

		{#if auth.unlocked}
			<section class="mt-6">
				<h3 class="mb-2 text-sm text-gray-500">Home Panel</h3>
				<button
					type="button"
					class="w-full rounded-xl bg-white/10 py-3 font-medium active:bg-white/20"
					onclick={() => (visibilityModalOpen = true)}
				>
					Choose Visible Devices
				</button>
				<button
					type="button"
					class="mt-2 w-full rounded-xl bg-white/10 py-3 font-medium active:bg-white/20"
					onclick={() => (reorderModalOpen = true)}
				>
					Reorder Home Panel
				</button>
			</section>
		{/if}
	</Modal>

	<EntityVisibilityModal bind:open={visibilityModalOpen} />
	<ReorderModal bind:open={reorderModalOpen} />
{/if}
