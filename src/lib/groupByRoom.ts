import { layoutOrder } from './layoutOrder.svelte';

const WHOLE_HOME_RE = /whole|apartment|home/i;

/**
 * Groups entities by HA area/room. Entities with no area, plus any area whose
 * name already reads as "whole home" (e.g. "Whole Apartment"), are merged into
 * one top-priority bucket; Kitchen comes next; everything else follows
 * alphabetically. Rooms and entities with a user-defined position (set via the
 * Reorder screen) sort by that position first.
 */
export function groupByRoom<T extends { area: string | null; entity_id: string }>(
	entities: T[]
): [string, T[]][] {
	const wholeHomeLabel =
		entities.map((e) => e.area).find((a): a is string => !!a && WHOLE_HOME_RE.test(a)) ??
		'Whole Home';

	const groups: Record<string, T[]> = {};
	for (const e of entities) {
		const room = e.area && !WHOLE_HOME_RE.test(e.area) ? e.area : wholeHomeLabel;
		(groups[room] ??= []).push(e);
	}

	function defaultPriority(room: string): number {
		if (room === wholeHomeLabel) return 0;
		if (room.toLowerCase() === 'kitchen') return 1;
		return 2;
	}

	const sorted = Object.entries(groups).sort((a, b) => {
		const rankDiff = layoutOrder.roomRank(a[0]) - layoutOrder.roomRank(b[0]);
		if (rankDiff !== 0) return rankDiff;
		const diff = defaultPriority(a[0]) - defaultPriority(b[0]);
		return diff !== 0 ? diff : a[0].localeCompare(b[0]);
	});

	for (const [, roomEntities] of sorted) {
		roomEntities.sort((a, b) => {
			const rankDiff = layoutOrder.entityRank(a.entity_id) - layoutOrder.entityRank(b.entity_id);
			return rankDiff !== 0 ? rankDiff : 0;
		});
	}

	return sorted;
}
