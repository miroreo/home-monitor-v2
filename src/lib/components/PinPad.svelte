<script lang="ts">
	let {
		onkey,
		onbackspace,
		onsubmit
	}: {
		onkey: (k: string) => void;
		onbackspace: () => void;
		onsubmit?: () => void;
	} = $props();

	const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
</script>

<div class="grid grid-cols-3 gap-2">
	{#each digits as d (d)}
		<button
			type="button"
			class="rounded-xl bg-white/10 py-4 text-2xl font-semibold active:bg-white/20"
			onclick={() => onkey(d)}
		>
			{d}
		</button>
	{/each}
	<button
		type="button"
		class="rounded-xl bg-white/10 py-4 text-lg font-semibold active:bg-white/20"
		onclick={onbackspace}
		aria-label="Backspace"
	>
		⌫
	</button>
	<button
		type="button"
		class="rounded-xl bg-white/10 py-4 text-2xl font-semibold active:bg-white/20"
		onclick={() => onkey('0')}
	>
		0
	</button>
	{#if onsubmit}
		<button
			type="button"
			class="rounded-xl bg-emerald-500/80 py-4 text-lg font-semibold active:bg-emerald-500"
			onclick={onsubmit}
			aria-label="Submit"
		>
			✓
		</button>
	{:else}
		<span></span>
	{/if}
</div>
