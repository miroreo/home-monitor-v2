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

/**
 * Resolves each entity's assigned area via HA's template API (the plain REST
 * /api/states endpoint doesn't include area/room info).
 */
export async function fetchEntityAreas(
	entityIds: string[]
): Promise<Record<string, string | null>> {
	if (entityIds.length === 0) return {};

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
