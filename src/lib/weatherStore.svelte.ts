import { createPoll } from './poll.svelte';
import type { WeatherData } from './types';

const poll = createPoll<WeatherData>(
	async () => {
		const res = await fetch('/api/weather');
		if (!res.ok) throw new Error('Failed to load weather');
		return res.json();
	},
	10 * 60 * 1000
);

let refCount = 0;

function acquire() {
	refCount++;
	if (refCount === 1) poll.start();
}

function release() {
	refCount--;
	if (refCount === 0) poll.stop();
}

export const weatherStore = {
	get data() {
		return poll.data;
	},
	get error() {
		return poll.error;
	},
	get loading() {
		return poll.loading;
	},
	acquire,
	release
};
