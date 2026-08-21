export function readLocalStorage(key: string): string | null {
	return typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null;
}

export function writeLocalStorage(key: string, value: string | null) {
	if (typeof localStorage === 'undefined') return;
	if (value === null) localStorage.removeItem(key);
	else localStorage.setItem(key, value);
}
