<script lang="ts">
	import Clock from '$lib/components/Clock.svelte';
	import LeavingSoonBanner from '$lib/components/LeavingSoonBanner.svelte';
	import WeatherCard from '$lib/components/WeatherCard.svelte';
	import ElectricPriceCard from '$lib/components/ElectricPriceCard.svelte';
	import TransitCard from '$lib/components/TransitCard.svelte';
	import HomeControls from '$lib/components/HomeControls.svelte';
	import SettingsButton from '$lib/components/SettingsButton.svelte';
	import RefreshButton from '$lib/components/RefreshButton.svelte';
</script>

<RefreshButton />
<SettingsButton />

<div class="flex h-screen w-screen flex-col gap-4 overflow-hidden p-6">
	<header class="flex shrink-0 items-center gap-6">
		<Clock />
		<div class="min-w-0 flex-1 pr-40">
			<LeavingSoonBanner />
		</div>
	</header>

	<div class="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)_minmax(0,3fr)] gap-4">
		<div class="flex min-h-0 flex-col gap-2">
			<div class="min-h-0 flex-1">
				<WeatherCard />
			</div>
			<div class="min-h-0 flex-1">
				<ElectricPriceCard />
			</div>
		</div>
		<div class="min-h-0">
			<TransitCard />
		</div>
		<div class="min-h-0">
			<HomeControls />
		</div>
	</div>
</div>
