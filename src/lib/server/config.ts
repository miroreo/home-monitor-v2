import { env } from '$env/dynamic/private';

function required(name: string): string {
	const value = env[name];
	if (!value) throw new Error(`Missing required environment variable: ${name}`);
	return value;
}

export function haConfig() {
	return {
		baseUrl: required('HA_BASE_URL').replace(/\/+$/, ''),
		token: required('HA_TOKEN')
	};
}

export function ctaConfig() {
	return {
		trainTrackerKey: required('CTA_TRAINTRACKER_KEY'),
		busTrackerKey: required('CTA_BUSTRACKER_KEY'),
		trainStations: required('CTA_TRAIN_STATIONS')
			.split(',')
			.map((s) => s.trim())
			.filter(Boolean),
		busStops: required('CTA_BUS_STOPS')
			.split(',')
			.map((s) => s.trim())
			.filter(Boolean)
	};
}

export function weatherConfig() {
	const [lat, lon] = required('WEATHER_LOCATION')
		.split(',')
		.map((s) => Number.parseFloat(s.trim()));
	if (Number.isNaN(lat) || Number.isNaN(lon)) {
		throw new Error('WEATHER_LOCATION must be formatted as "lat,lon"');
	}
	return { lat, lon };
}

/** The PIN/PSK required to unlock Home controls. Optional: null until set in .env. */
export function controlSecret(): string | null {
	const value = env.HA_CONTROL_SECRET;
	return value && value.length > 0 ? value : null;
}
