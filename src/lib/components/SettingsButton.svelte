<script lang="ts">
	import SettingsModal from './SettingsModal.svelte';
	import GearIcon from './icons/GearIcon.svelte';

	let open = $state(false);
</script>

<button
	type="button"
	class="fixed top-4 right-4 z-40 rounded-full bg-white/10 p-4 text-gray-300 active:bg-white/20"
	onclick={() => (open = true)}
	aria-label="Settings"
>
	<GearIcon class="h-7 w-7" />
</button>

<SettingsModal bind:open />
