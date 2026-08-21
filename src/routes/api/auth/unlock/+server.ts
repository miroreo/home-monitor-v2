import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { AuthError, issueSessionToken, verifySecret } from '$lib/server/authStore';

export const POST: RequestHandler = async ({ request }) => {
	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return json({ error: 'Invalid JSON body' }, { status: 400 });
	}

	if (
		typeof body !== 'object' ||
		body === null ||
		typeof (body as Record<string, unknown>).secret !== 'string'
	) {
		return json({ error: 'secret is required' }, { status: 400 });
	}

	const { secret } = body as { secret: string };

	try {
		verifySecret(secret);
		const token = issueSessionToken();
		return json({ token });
	} catch (err) {
		if (err instanceof AuthError) {
			if (err.code === 'not_configured') {
				return json({ error: 'No PIN/PSK configured yet' }, { status: 409 });
			}
			if (err.code === 'locked_out') {
				return json(
					{ error: 'Too many attempts', retryAfterMs: err.retryAfterMs },
					{ status: 423 }
				);
			}
			return json({ error: 'Incorrect PIN/PSK' }, { status: 401 });
		}
		console.error('Failed to unlock', err);
		return json({ error: 'Failed to unlock' }, { status: 500 });
	}
};
