export type WeatherIconKind = 'sun' | 'cloud-sun' | 'cloud' | 'fog' | 'rain' | 'snow' | 'storm';

// WMO weather codes used by Open-Meteo: https://open-meteo.com/en/docs
const CODES: Record<number, { label: string; icon: WeatherIconKind }> = {
	0: { label: 'Clear sky', icon: 'sun' },
	1: { label: 'Mainly clear', icon: 'sun' },
	2: { label: 'Partly cloudy', icon: 'cloud-sun' },
	3: { label: 'Overcast', icon: 'cloud' },
	45: { label: 'Fog', icon: 'fog' },
	48: { label: 'Depositing rime fog', icon: 'fog' },
	51: { label: 'Light drizzle', icon: 'rain' },
	53: { label: 'Drizzle', icon: 'rain' },
	55: { label: 'Dense drizzle', icon: 'rain' },
	56: { label: 'Freezing drizzle', icon: 'rain' },
	57: { label: 'Dense freezing drizzle', icon: 'rain' },
	61: { label: 'Light rain', icon: 'rain' },
	63: { label: 'Rain', icon: 'rain' },
	65: { label: 'Heavy rain', icon: 'rain' },
	66: { label: 'Freezing rain', icon: 'rain' },
	67: { label: 'Heavy freezing rain', icon: 'rain' },
	71: { label: 'Light snow', icon: 'snow' },
	73: { label: 'Snow', icon: 'snow' },
	75: { label: 'Heavy snow', icon: 'snow' },
	77: { label: 'Snow grains', icon: 'snow' },
	80: { label: 'Light showers', icon: 'rain' },
	81: { label: 'Showers', icon: 'rain' },
	82: { label: 'Violent showers', icon: 'storm' },
	85: { label: 'Snow showers', icon: 'snow' },
	86: { label: 'Heavy snow showers', icon: 'snow' },
	95: { label: 'Thunderstorm', icon: 'storm' },
	96: { label: 'Thunderstorm w/ hail', icon: 'storm' },
	99: { label: 'Severe thunderstorm w/ hail', icon: 'storm' }
};

export function weatherCodeInfo(code: number): { label: string; icon: WeatherIconKind } {
	return CODES[code] ?? { label: 'Unknown', icon: 'cloud' };
}
