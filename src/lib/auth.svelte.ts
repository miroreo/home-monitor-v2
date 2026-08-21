import { readLocalStorage, writeLocalStorage } from './localStorage';

const TOKEN_KEY = 'ha-auth-token';
const KEYPAD_KEY = 'ha-keypad-style';

type KeypadStyle = 'numeric' | 'alphanumeric';
type ActionResult = { ok: true } | { ok: false; error: string; retryAfterMs?: number };

let token = $state<string | null>(readLocalStorage(TOKEN_KEY));
let configured = $state(false);
let statusLoaded = $state(false);
let keypadStyle = $state<KeypadStyle>(
	readLocalStorage(KEYPAD_KEY) === 'alphanumeric' ? 'alphanumeric' : 'numeric'
);

async function refreshStatus() {
	try {
		const res = await fetch('/api/auth/status');
		if (res.ok) {
			const data = (await res.json()) as { configured: boolean };
			configured = data.configured;
		}
	} finally {
		statusLoaded = true;
	}
}

async function unlock(secret: string): Promise<ActionResult> {
	const res = await fetch('/api/auth/unlock', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ secret })
	});
	const data = await res.json();
	if (!res.ok) {
		return { ok: false, error: data.error ?? 'Failed to unlock', retryAfterMs: data.retryAfterMs };
	}
	token = data.token as string;
	writeLocalStorage(TOKEN_KEY, token);
	return { ok: true };
}

function lock() {
	token = null;
	writeLocalStorage(TOKEN_KEY, null);
}

function setKeypadStyle(style: KeypadStyle) {
	keypadStyle = style;
	writeLocalStorage(KEYPAD_KEY, style);
}

function authHeaders(): Record<string, string> {
	return token ? { Authorization: `Bearer ${token}` } : {};
}

export const auth = {
	get token() {
		return token;
	},
	get unlocked() {
		return token !== null;
	},
	get configured() {
		return configured;
	},
	get statusLoaded() {
		return statusLoaded;
	},
	get keypadStyle() {
		return keypadStyle;
	},
	refreshStatus,
	unlock,
	lock,
	setKeypadStyle,
	authHeaders
};
