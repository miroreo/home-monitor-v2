import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { fetchElectricPrice } from '$lib/server/comed';

export const GET: RequestHandler = async () => {
	try {
		const data = await fetchElectricPrice();
		return json(data);
	} catch (err) {
		console.error('Failed to fetch ComEd electric price', err);
		return json({ error: 'Failed to fetch electric price' }, { status: 502 });
	}
};
