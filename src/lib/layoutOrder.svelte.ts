import { readLocalStorage, writeLocalStorage } from './localStorage';

const ROOM_ORDER_KEY = 'ha-room-order';
const ENTITY_ORDER_KEY = 'ha-entity-order';

function readList(key: string): string[] {
	const raw = readLocalStorage(key);
	if (!raw) return [];
	try {
		return JSON.parse(raw) as string[];
	} catch {
		return [];
	}
}

let roomOrder = $state<string[]>(readList(ROOM_ORDER_KEY));
let entityOrder = $state<string[]>(readList(ENTITY_ORDER_KEY));

function setRoomOrder(order: string[]) {
	roomOrder = order;
	writeLocalStorage(ROOM_ORDER_KEY, JSON.stringify(order));
}

function setEntityOrder(order: string[]) {
	entityOrder = order;
	writeLocalStorage(ENTITY_ORDER_KEY, JSON.stringify(order));
}

function reset() {
	setRoomOrder([]);
	setEntityOrder([]);
}

/** Rank for sorting; items with no custom position sort after all ranked ones. */
function roomRank(room: string): number {
	const i = roomOrder.indexOf(room);
	return i === -1 ? Number.MAX_SAFE_INTEGER : i;
}

function entityRank(entityId: string): number {
	const i = entityOrder.indexOf(entityId);
	return i === -1 ? Number.MAX_SAFE_INTEGER : i;
}

export const layoutOrder = {
	get roomOrder() {
		return roomOrder;
	},
	get entityOrder() {
		return entityOrder;
	},
	setRoomOrder,
	setEntityOrder,
	reset,
	roomRank,
	entityRank
};
