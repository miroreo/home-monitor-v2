import { weatherConfig } from './config';
import type { WeatherData } from '$lib/types';

interface OpenMeteoResponse {
	current: {
		time: string;
		temperature_2m: number;
		relative_humidity_2m: number;
		apparent_temperature: number;
		precipitation: number;
		weather_code: number;
		wind_speed_10m: number;
		is_day: number;
	};
	hourly: {
		time: string[];
		temperature_2m: number[];
		precipitation_probability: number[];
	};
	daily: {
		time: string[];
		weather_code: number[];
		temperature_2m_max: number[];
		temperature_2m_min: number[];
	};
}

export async function fetchWeather(): Promise<WeatherData> {
	const { lat, lon } = weatherConfig();
	const url = new URL('https://api.open-meteo.com/v1/forecast');
	url.searchParams.set('latitude', String(lat));
	url.searchParams.set('longitude', String(lon));
	url.searchParams.set(
		'current',
		'temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,is_day'
	);
	url.searchParams.set('hourly', 'temperature_2m,precipitation_probability');
	url.searchParams.set('daily', 'weather_code,temperature_2m_max,temperature_2m_min');
	url.searchParams.set('temperature_unit', 'fahrenheit');
	url.searchParams.set('wind_speed_unit', 'mph');
	url.searchParams.set('precipitation_unit', 'inch');
	url.searchParams.set('timezone', 'auto');
	url.searchParams.set('forecast_days', '5');

	const res = await fetch(url);
	if (!res.ok) throw new Error(`Open-Meteo request failed (${res.status})`);
	const data = (await res.json()) as OpenMeteoResponse;

	const nowIndex = Math.max(
		0,
		data.hourly.time.findIndex((t) => t >= data.current.time)
	);

	return {
		current: {
			temperature: data.current.temperature_2m,
			apparentTemperature: data.current.apparent_temperature,
			humidity: data.current.relative_humidity_2m,
			precipitation: data.current.precipitation,
			weatherCode: data.current.weather_code,
			windSpeed: data.current.wind_speed_10m,
			isDay: data.current.is_day === 1
		},
		hourly: data.hourly.time.slice(nowIndex, nowIndex + 12).map((time, i) => ({
			time,
			temperature: data.hourly.temperature_2m[nowIndex + i],
			precipitationProbability: data.hourly.precipitation_probability[nowIndex + i]
		})),
		daily: data.daily.time.map((date, i) => ({
			date,
			weatherCode: data.daily.weather_code[i],
			max: data.daily.temperature_2m_max[i],
			min: data.daily.temperature_2m_min[i]
		}))
	};
}
