export function createPoll<T>(fetcher: () => Promise<T>, intervalMs: number) {
	let data = $state<T | null>(null);
	let error = $state<string | null>(null);
	let loading = $state(true);
	let timer: ReturnType<typeof setInterval> | undefined;

	async function tick() {
		try {
			data = await fetcher();
			error = null;
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to load';
		} finally {
			loading = false;
		}
	}

	function start() {
		tick();
		timer = setInterval(tick, intervalMs);
	}

	function stop() {
		if (timer) clearInterval(timer);
	}

	return {
		get data() {
			return data;
		},
		get error() {
			return error;
		},
		get loading() {
			return loading;
		},
		start,
		stop,
		refresh: tick
	};
}
