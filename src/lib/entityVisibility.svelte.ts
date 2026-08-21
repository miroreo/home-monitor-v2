import { SvelteSet } from 'svelte/reactivity';
import { readLocalStorage, writeLocalStorage } from './localStorage';

const ENABLED_KEY = 'ha-visible-entities-enabled';
const IDS_KEY = 'ha-visible-entities-ids';

function readIds(): string[] {
	const raw = readLocalStorage(IDS_KEY);
	if (!raw) return [];
	try {
		return JSON.parse(raw) as string[];
	} catch {
		return [];
	}
}

let filterEnabled = $state(readLocalStorage(ENABLED_KEY) === '1');
const visibleIds = new SvelteSet<string>(readIds());

function persistIds() {
	writeLocalStorage(IDS_KEY, JSON.stringify([...visibleIds]));
}

function setFilterEnabled(value: boolean) {
	filterEnabled = value;
	writeLocalStorage(ENABLED_KEY, value ? '1' : null);
}

function setVisible(entityId: string, visible: boolean) {
	if (visible) visibleIds.add(entityId);
	else visibleIds.delete(entityId);
	persistIds();
}

function addAll(entityIds: string[]) {
	for (const id of entityIds) visibleIds.add(id);
	persistIds();
}

function removeAll(entityIds: string[]) {
	for (const id of entityIds) visibleIds.delete(id);
	persistIds();
}

function clearAll() {
	visibleIds.clear();
	persistIds();
}

function isVisible(entityId: string): boolean {
	return !filterEnabled || visibleIds.has(entityId);
}

export const entityVisibility = {
	get filterEnabled() {
		return filterEnabled;
	},
	get visibleIds(): ReadonlySet<string> {
		return visibleIds;
	},
	setFilterEnabled,
	setVisible,
	addAll,
	removeAll,
	clearAll,
	isVisible
};
