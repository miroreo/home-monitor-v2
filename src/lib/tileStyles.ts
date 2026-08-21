/** Shared border/background classes for the small toggle-style entity tiles. */
export function tileAccent(active: boolean, color: 'emerald' | 'amber' = 'emerald'): string {
	if (!active) return 'border-white/10 bg-white/5';
	return color === 'amber'
		? 'border-amber-400/40 bg-amber-400/15'
		: 'border-emerald-400/40 bg-emerald-400/15';
}
