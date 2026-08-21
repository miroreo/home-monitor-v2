// Domains with an interactive control tile. Every other domain (sensors,
// binary_sensors, weather, person, automations, etc.) renders read-only.
export const CONTROLLABLE_DOMAINS = [
	'light',
	'switch',
	'climate',
	'fan',
	'lock',
	'cover',
	'scene',
	'input_boolean',
	'media_player',
	'vacuum'
] as const;

export type ControllableDomain = (typeof CONTROLLABLE_DOMAINS)[number];

export function isControllableDomain(domain: string): domain is ControllableDomain {
	return (CONTROLLABLE_DOMAINS as readonly string[]).includes(domain);
}
