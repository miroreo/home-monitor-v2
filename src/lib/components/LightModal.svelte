<script lang="ts">
	import type { HaEntity } from '$lib/types';
	import { lightCapabilities } from '$lib/lightCaps';
	import Modal from './Modal.svelte';

	let {
		entity,
		pending,
		callService,
		onclose
	}: {
		entity: HaEntity;
		pending: Record<string, boolean>;
		callService: (
			entityId: string,
			service: string,
			data?: Record<string, unknown>,
			optimisticState?: string
		) => void;
		onclose: () => void;
	} = $props();

	// A bulb that supports both color and white-spectrum starts on whichever
	// mode it's actually in right now, not a hardcoded default. Intentionally
	// captured once at open time — the tab shouldn't jump on subsequent polls.
	// svelte-ignore state_referenced_locally
	let tab = $state<'color' | 'white'>(
		entity.attributes.color_mode === 'color_temp' ? 'white' : 'color'
	);

	function initialHueSat(e: HaEntity): [number, number] {
		const hs = e.attributes.hs_color as [number, number] | undefined;
		return hs ? [hs[0], hs[1]] : [0, 100];
	}

	// Same reasoning as `tab`: seed once from the bulb's current value, then
	// the slider owns it while the user is actively dragging.
	// svelte-ignore state_referenced_locally
	let hue = $state(initialHueSat(entity)[0]);
	// svelte-ignore state_referenced_locally
	let saturation = $state(initialHueSat(entity)[1]);

	const on = $derived(entity.state === 'on');
	const caps = $derived(lightCapabilities(entity));
	const showColor = $derived(caps.color && (tab === 'color' || !caps.colorTemp));
	const showWhite = $derived(caps.colorTemp && (tab === 'white' || !caps.color));

	function commitColor() {
		callService(entity.entity_id, 'turn_on', { hs_color: [hue, saturation] });
	}

	// Reset the native slider chrome and draw a small custom track + thumb —
	// the default browser thumb is a huge circle that overwhelms this dialog.
	const RANGE_CLASS =
		'h-2 w-full min-w-0 cursor-pointer appearance-none rounded-full bg-white/15 ' +
		'[&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none ' +
		'[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white ' +
		'[&::-webkit-slider-thumb]:bg-white/40 ' +
		'[&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:rounded-full ' +
		'[&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:bg-white/40';

	const HUE_GRADIENT =
		'linear-gradient(to right, hsl(0,100%,50%), hsl(60,100%,50%), hsl(120,100%,50%), ' +
		'hsl(180,100%,50%), hsl(240,100%,50%), hsl(300,100%,50%), hsl(360,100%,50%))';

	// Rough blackbody-radiation approximation (warm amber -> neutral -> cool blue-white).
	const COLOR_TEMP_GRADIENT =
		'linear-gradient(to right, #ff8b24, #ffcf94, #fff4e5, #d6e4ff, #a8c8ff)';
</script>

<Modal title={entity.name} {onclose}>
	<button
		type="button"
		class="mb-4 w-full rounded-xl py-3 font-medium {on
			? 'bg-emerald-500/80 active:bg-emerald-500'
			: 'bg-white/10 active:bg-white/20'}"
		disabled={pending[entity.entity_id]}
		onclick={() => callService(entity.entity_id, 'toggle', undefined, on ? 'off' : 'on')}
	>
		{on ? 'On' : 'Off'}
	</button>

	{#if on}
		{#if caps.brightness}
			<div class="mb-4">
				<span class="mb-1 block text-xs text-gray-500">Brightness</span>
				<input
					type="range"
					min="1"
					max="255"
					value={entity.attributes.brightness ?? 255}
					class={RANGE_CLASS}
					disabled={pending[entity.entity_id]}
					onchange={(ev) =>
						callService(entity.entity_id, 'turn_on', {
							brightness: Number(ev.currentTarget.value)
						})}
				/>
			</div>
		{/if}

		{#if caps.color && caps.colorTemp}
			<div class="mb-3 flex gap-2 text-sm">
				<button
					type="button"
					class="flex-1 rounded-lg py-1.5 {tab === 'color'
						? 'bg-white/20'
						: 'bg-white/5 text-gray-400'}"
					onclick={() => (tab = 'color')}
				>
					Color
				</button>
				<button
					type="button"
					class="flex-1 rounded-lg py-1.5 {tab === 'white'
						? 'bg-white/20'
						: 'bg-white/5 text-gray-400'}"
					onclick={() => (tab = 'white')}
				>
					White
				</button>
			</div>
		{/if}

		{#if showColor}
			<div class="mb-2">
				<div class="mb-1 flex items-center gap-2">
					<span class="text-xs text-gray-500">Hue</span>
					<span
						class="ml-auto h-5 w-9 rounded border border-white/20"
						style:background="hsl({hue}, {saturation}%, 50%)"
					></span>
				</div>
				<input
					type="range"
					min="0"
					max="359"
					value={hue}
					class={RANGE_CLASS}
					style:background={HUE_GRADIENT}
					disabled={pending[entity.entity_id]}
					oninput={(ev) => (hue = Number(ev.currentTarget.value))}
					onchange={commitColor}
				/>
				<span class="mt-3 mb-1 block text-xs text-gray-500">Saturation</span>
				<input
					type="range"
					min="0"
					max="100"
					value={saturation}
					class={RANGE_CLASS}
					style:background="linear-gradient(to right, hsl({hue},0%,50%), hsl({hue},100%,50%))"
					disabled={pending[entity.entity_id]}
					oninput={(ev) => (saturation = Number(ev.currentTarget.value))}
					onchange={commitColor}
				/>
			</div>
		{/if}

		{#if showWhite}
			<div class="mb-2">
				<span class="mb-1 block text-xs text-gray-500">Warmth</span>
				<input
					type="range"
					min={Number(entity.attributes.min_color_temp_kelvin ?? 2000)}
					max={Number(entity.attributes.max_color_temp_kelvin ?? 6500)}
					value={Number(entity.attributes.color_temp_kelvin ?? 3000)}
					class={RANGE_CLASS}
					style:background={COLOR_TEMP_GRADIENT}
					disabled={pending[entity.entity_id]}
					onchange={(ev) =>
						callService(entity.entity_id, 'turn_on', {
							color_temp_kelvin: Number(ev.currentTarget.value)
						})}
				/>
			</div>
		{/if}
	{/if}
</Modal>
