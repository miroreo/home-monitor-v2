import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { requireSessionAuth } from '$lib/server/authStore';
import { callHaService, isControllableDomain } from '$lib/server/ha';

const SERVICE_NAME_RE = /^[a-z_]+$/;

export const POST: RequestHandler = async ({ request }) => {
	if (!requireSessionAuth(request)) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return json({ error: 'Invalid JSON body' }, { status: 400 });
	}

	if (
		typeof body !== 'object' ||
		body === null ||
		typeof (body as Record<string, unknown>).entity_id !== 'string' ||
		typeof (body as Record<string, unknown>).service !== 'string'
	) {
		return json({ error: 'Body must include entity_id and service strings' }, { status: 400 });
	}

	const { entity_id, service, data } = body as {
		entity_id: string;
		service: string;
		data?: Record<string, unknown>;
	};

	const domain = entity_id.split('.')[0];
	if (!isControllableDomain(domain)) {
		return json({ error: `Domain "${domain}" is not controllable` }, { status: 400 });
	}
	if (!SERVICE_NAME_RE.test(service)) {
		return json({ error: 'Invalid service name' }, { status: 400 });
	}
	if (data !== undefined && (typeof data !== 'object' || data === null || Array.isArray(data))) {
		return json({ error: 'data must be an object' }, { status: 400 });
	}

	try {
		await callHaService(domain, service, entity_id, data);
		return json({ ok: true });
	} catch (err) {
		console.error('Failed to call Home Assistant service', err);
		return json({ error: 'Failed to call Home Assistant service' }, { status: 502 });
	}
};
