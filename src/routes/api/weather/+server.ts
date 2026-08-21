import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { fetchWeather } from '$lib/server/weather';

export const GET: RequestHandler = async () => {
	try {
		const data = await fetchWeather();
		return json(data);
	} catch (err) {
		console.error('Failed to fetch weather', err);
		return json({ error: 'Failed to fetch weather' }, { status: 502 });
	}
};
