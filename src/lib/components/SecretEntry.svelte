<script lang="ts">
	import { auth } from '$lib/auth.svelte';
	import PinPad from './PinPad.svelte';
	import OnScreenKeyboard from './OnScreenKeyboard.svelte';

	let {
		value = $bindable(''),
		placeholder = 'PIN or PSK',
		id,
		onsubmit
	}: {
		value?: string;
		placeholder?: string;
		id?: string;
		onsubmit?: () => void;
	} = $props();

	function onkey(k: string) {
		value += k;
	}
	function onbackspace() {
		value = value.slice(0, -1);
	}
	function onspace() {
		value += ' ';
	}
</script>

<div class="flex flex-col gap-3">
	<input
		{id}
		type="password"
		autocomplete="off"
		inputmode={auth.keypadStyle === 'numeric' ? 'numeric' : 'text'}
		class="w-full rounded-lg border border-white/20 bg-black/30 px-4 py-3 text-xl tracking-widest"
		bind:value
		{placeholder}
	/>
	{#if auth.keypadStyle === 'numeric'}
		<PinPad {onkey} {onbackspace} {onsubmit} />
	{:else}
		<OnScreenKeyboard {onkey} {onbackspace} {onspace} />
	{/if}
</div>
