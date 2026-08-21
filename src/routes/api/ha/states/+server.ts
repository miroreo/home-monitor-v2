import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { requireSessionAuth } from '$lib/server/authStore';
import { fetchEntityAreas, fetchHaStates } from '$lib/server/ha';
import type { HaEntity } from '$lib/types';

export const GET: RequestHandler = async ({ request }) => {
	if (!requireSessionAuth(request)) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const states = await fetchHaStates();
		const all = states.map((s) => {
			const domain = s.entity_id.split('.')[0];
			return { domain, entity: s };
		});

		const areas = await fetchEntityAreas(all.map(({ entity }) => entity.entity_id));

		const entities: HaEntity[] = all
			.map(({ domain, entity }) => ({
				entity_id: entity.entity_id,
				domain,
				name: (entity.attributes.friendly_name as string | undefined) ?? entity.entity_id,
				state: entity.state,
				attributes: entity.attributes,
				area: areas[entity.entity_id] ?? null
			}))
			.sort((a, b) => a.name.localeCompare(b.name));

		return json(entities);
	} catch (err) {
		console.error('Failed to fetch Home Assistant states', err);
		return json({ error: 'Failed to fetch Home Assistant states' }, { status: 502 });
	}
};
