import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { fetchBusPredictions, fetchRailAlerts, fetchTrainPredictions } from '$lib/server/cta';
import type { TransitData } from '$lib/types';

export const GET: RequestHandler = async () => {
	const [busesResult, trainsResult, alertsResult] = await Promise.allSettled([
		fetchBusPredictions(),
		fetchTrainPredictions(),
		fetchRailAlerts()
	]);

	if (busesResult.status === 'rejected') {
		console.error('Failed to fetch CTA bus predictions', busesResult.reason);
	}
	if (trainsResult.status === 'rejected') {
		console.error('Failed to fetch CTA train predictions', trainsResult.reason);
	}
	if (alertsResult.status === 'rejected') {
		console.error('Failed to fetch CTA rail alerts', alertsResult.reason);
	}

	if (busesResult.status === 'rejected' && trainsResult.status === 'rejected') {
		return json({ error: 'Failed to fetch transit data' }, { status: 502 });
	}

	const data: TransitData = {
		buses: busesResult.status === 'fulfilled' ? busesResult.value : [],
		trains: trainsResult.status === 'fulfilled' ? trainsResult.value : [],
		railAlerts: alertsResult.status === 'fulfilled' ? alertsResult.value : []
	};
	return json(data);
};
