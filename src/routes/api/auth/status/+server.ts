import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { isConfigured } from '$lib/server/authStore';

export const GET: RequestHandler = async () => {
	return json({ configured: isConfigured() });
};
