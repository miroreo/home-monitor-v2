import type { ElectricPriceData } from '$lib/types';

const BASE_URL = 'https://hourlypricing.comed.com/api';

interface ComedReading {
	millisUTC: string;
	price: string;
}

async function fetchComed(type: string): Promise<ComedReading[]> {
	const res = await fetch(`${BASE_URL}?type=${type}&format=json`);
	if (!res.ok) {
		throw new Error(`ComEd request failed (${res.status})`);
	}
	return (await res.json()) as ComedReading[];
}

export async function fetchElectricPrice(): Promise<ElectricPriceData> {
	const [feed, hourAverage] = await Promise.all([
		fetchComed('5minutefeed'),
		fetchComed('currenthouraverage')
	]);

	if (feed.length === 0) {
		throw new Error('ComEd 5-minute feed returned no data');
	}

	// The API does not guarantee ordering, so sort ascending by time ourselves.
	const sorted = [...feed].sort(
		(a, b) => Number.parseInt(a.millisUTC, 10) - Number.parseInt(b.millisUTC, 10)
	);
	const latest = sorted[sorted.length - 1];
	const recent = sorted.slice(-24).map((r) => ({
		millis: Number.parseInt(r.millisUTC, 10),
		price: Number.parseFloat(r.price)
	}));

	return {
		currentCentsPerKwh: Number.parseFloat(latest.price),
		currentHourAverageCentsPerKwh: hourAverage[0] ? Number.parseFloat(hourAverage[0].price) : null,
		updatedAt: new Date(Number.parseInt(latest.millisUTC, 10)).toISOString(),
		recent
	};
}
