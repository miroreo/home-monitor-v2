import { randomBytes, timingSafeEqual, createHmac } from 'node:crypto';
import { controlSecret } from './config';

const MAX_FAILURES = 5;
const LOCKOUT_MS = 30_000;
// Session tokens don't expire during normal use ("until manually locked"), but
// carry a generous ceiling so a leaked token can't be replayed indefinitely.
const SESSION_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 30;

// Regenerated whenever the server restarts, which invalidates all outstanding
// session tokens — there's nothing to persist since the secret itself lives in env.
const sessionSecret = randomBytes(32);

let failCount = 0;
let lockedUntil = 0;

export class AuthError extends Error {
	code: 'not_configured' | 'invalid' | 'locked_out';
	retryAfterMs: number;

	constructor(code: 'not_configured' | 'invalid' | 'locked_out', retryAfterMs = 0) {
		super(code);
		this.code = code;
		this.retryAfterMs = retryAfterMs;
	}
}

export function isConfigured(): boolean {
	return controlSecret() !== null;
}

function checkLockout() {
	if (Date.now() < lockedUntil) {
		throw new AuthError('locked_out', lockedUntil - Date.now());
	}
}

function registerFailure() {
	failCount += 1;
	if (failCount >= MAX_FAILURES) {
		lockedUntil = Date.now() + LOCKOUT_MS;
		failCount = 0;
	}
}

function registerSuccess() {
	failCount = 0;
	lockedUntil = 0;
}

function timingSafeStringEqual(a: string, b: string): boolean {
	const aBuf = Buffer.from(a);
	const bBuf = Buffer.from(b);
	if (aBuf.length !== bBuf.length) {
		// Still do a same-cost comparison so failure timing doesn't trivially
		// reveal the expected length.
		timingSafeEqual(aBuf, aBuf);
		return false;
	}
	return timingSafeEqual(aBuf, bBuf);
}

/** Throws AuthError on failure; returns normally on success. */
export function verifySecret(secret: string): void {
	checkLockout();
	const expected = controlSecret();
	if (!expected) throw new AuthError('not_configured');

	if (!timingSafeStringEqual(secret, expected)) {
		registerFailure();
		throw new AuthError('invalid');
	}
	registerSuccess();
}

export function issueSessionToken(): string {
	if (!isConfigured()) throw new AuthError('not_configured');
	const issuedAt = Date.now().toString();
	const sig = createHmac('sha256', sessionSecret).update(issuedAt).digest('hex');
	return `${issuedAt}.${sig}`;
}

export function verifySessionToken(token: string | null | undefined): boolean {
	if (!token || !isConfigured()) return false;

	const [issuedAt, sig] = token.split('.');
	if (!issuedAt || !sig) return false;

	const age = Date.now() - Number(issuedAt);
	if (!Number.isFinite(age) || age < 0 || age > SESSION_MAX_AGE_MS) return false;

	const expected = createHmac('sha256', sessionSecret).update(issuedAt).digest('hex');
	const a = Buffer.from(sig, 'hex');
	const b = Buffer.from(expected, 'hex');
	return a.length === b.length && timingSafeEqual(a, b);
}

/** Extracts and verifies the "Authorization: Bearer <token>" header. */
export function requireSessionAuth(request: Request): boolean {
	const header = request.headers.get('authorization') ?? '';
	const token = header.startsWith('Bearer ') ? header.slice(7) : null;
	return verifySessionToken(token);
}
