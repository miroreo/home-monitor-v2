<script lang="ts">
	let {
		onkey,
		onbackspace,
		onspace
	}: {
		onkey: (k: string) => void;
		onbackspace: () => void;
		onspace: () => void;
	} = $props();

	let shift = $state(false);

	const rows = [
		['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
		['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
		['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
		['z', 'x', 'c', 'v', 'b', 'n', 'm']
	];

	function press(k: string) {
		onkey(shift ? k.toUpperCase() : k);
	}
</script>

<div class="flex flex-col gap-1.5">
	{#each rows as row, i (i)}
		<div class="flex justify-center gap-1.5">
			{#each row as k (k)}
				<button
					type="button"
					class="min-w-9 flex-1 rounded-lg bg-white/10 py-3 text-sm font-medium active:bg-white/20"
					onclick={() => press(k)}
				>
					{shift ? k.toUpperCase() : k}
				</button>
			{/each}
		</div>
	{/each}
	<div class="flex justify-center gap-1.5">
		<button
			type="button"
			class="rounded-lg px-4 py-3 text-sm font-medium active:bg-white/20 {shift
				? 'bg-white/25'
				: 'bg-white/10'}"
			onclick={() => (shift = !shift)}
		>
			⇧ Shift
		</button>
		<button
			type="button"
			class="flex-1 rounded-lg bg-white/10 px-4 py-3 text-sm font-medium active:bg-white/20"
			onclick={onspace}
		>
			Space
		</button>
		<button
			type="button"
			class="rounded-lg bg-white/10 px-4 py-3 text-sm font-medium active:bg-white/20"
			onclick={onbackspace}
			aria-label="Backspace"
		>
			⌫
		</button>
	</div>
</div>
