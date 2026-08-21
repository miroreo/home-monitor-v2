import { haConfig } from './config';
import type { ControllableDomain } from '$lib/domains';

export { CONTROLLABLE_DOMAINS, isControllableDomain } from '$lib/domains';
export type { ControllableDomain } from '$lib/domains';

async function haFetch(path: string, init?: RequestInit): Promise<Response> {
	const { baseUrl, token } = haConfig();
	const res = await fetch(`${baseUrl}${path}`, {
		...init,
		headers: {
			Authorization: `Bearer ${token}`,
			'Content-Type': 'application/json',
			...init?.headers
		}
	});
	if (!res.ok) {
		const body = await res.text().catch(() => '');
		throw new Error(`Home Assistant request failed (${res.status}): ${body.slice(0, 300)}`);
	}
	return res;
}

export async function fetchHaStates() {
	const res = await haFetch('/api/states');
	return (await res.json()) as {
		entity_id: string;
		state: string;
		attributes: Record<string, unknown>;
	}[];
}

// Entity-to-area assignments almost never change while the server is
// running, but the states poll (every 15s, plus once more after every
// control action) used to re-resolve every entity's area via a fresh HA
// template call each time. That round trip was the biggest chunk of the
// delay between tapping a tile and seeing its new state, so cache results
// and only re-query entities we haven't seen, refreshing the whole set
// occasionally in case areas were reassigned in HA.
const AREA_CACHE_TTL_MS = 5 * 60 * 1000;
const areaCache = new Map<string, string | null>();
let areaCacheAt = 0;

async function resolveAreas(entityIds: string[]): Promise<Record<string, string | null>> {
	const template =
		'[' + entityIds.map((id) => `{{ area_name(${JSON.stringify(id)}) | tojson }}`).join(',') + ']';
	const res = await haFetch('/api/template', {
		method: 'POST',
		body: JSON.stringify({ template })
	});
	const areas = (await res.json()) as (string | null)[];

	const result: Record<string, string | null> = {};
	entityIds.forEach((id, i) => {
		result[id] = areas[i] ?? null;
	});
	return result;
}

/**
 * Resolves each entity's assigned area via HA's template API (the plain REST
 * /api/states endpoint doesn't include area/room info). Cached per entity_id
 * with a periodic full refresh — see comment above.
 */
export async function fetchEntityAreas(
	entityIds: string[]
): Promise<Record<string, string | null>> {
	if (entityIds.length === 0) return {};

	const stale = Date.now() - areaCacheAt > AREA_CACHE_TTL_MS;
	const idsToFetch = stale ? entityIds : entityIds.filter((id) => !areaCache.has(id));

	if (idsToFetch.length > 0) {
		const resolved = await resolveAreas(idsToFetch);
		for (const [id, area] of Object.entries(resolved)) areaCache.set(id, area);
		if (stale) areaCacheAt = Date.now();
	}

	const result: Record<string, string | null> = {};
	for (const id of entityIds) result[id] = areaCache.get(id) ?? null;
	return result;
}

export async function callHaService(
	domain: ControllableDomain,
	service: string,
	entityId: string,
	data?: Record<string, unknown>
) {
	await haFetch(`/api/services/${domain}/${service}`, {
		method: 'POST',
		body: JSON.stringify({ entity_id: entityId, ...data })
	});
}
