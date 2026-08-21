<script lang="ts">
	let {
		disabledUp,
		disabledDown,
		onup,
		ondown,
		label
	}: {
		disabledUp: boolean;
		disabledDown: boolean;
		onup: () => void;
		ondown: () => void;
		label: string;
	} = $props();
</script>

<div class="flex shrink-0 gap-1">
	<button
		type="button"
		class="h-6 w-6 rounded bg-white/10 text-xs disabled:opacity-30"
		disabled={disabledUp}
		onclick={onup}
		aria-label="Move {label} up"
	>
		▲
	</button>
	<button
		type="button"
		class="h-6 w-6 rounded bg-white/10 text-xs disabled:opacity-30"
		disabled={disabledDown}
		onclick={ondown}
		aria-label="Move {label} down"
	>
		▼
	</button>
</div>
