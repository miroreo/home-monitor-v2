export interface HaEntity {
	entity_id: string;
	domain: string;
	name: string;
	state: string;
	attributes: Record<string, unknown>;
	area: string | null;
}

export interface WeatherData {
	current: {
		temperature: number;
		apparentTemperature: number;
		humidity: number;
		precipitation: number;
		weatherCode: number;
		windSpeed: number;
		isDay: boolean;
	};
	hourly: {
		time: string;
		temperature: number;
		precipitationProbability: number;
	}[];
	daily: {
		date: string;
		weatherCode: number;
		max: number;
		min: number;
	}[];
}

export interface ElectricPriceData {
	currentCentsPerKwh: number;
	currentHourAverageCentsPerKwh: number | null;
	updatedAt: string;
	recent: { millis: number; price: number }[];
}

export interface BusPrediction {
	stopId: string;
	stopName: string;
	route: string;
	destination: string;
	minutesAway: number | 'DUE';
}

export interface TrainPrediction {
	stationId: string;
	stationName: string;
	line: string;
	destination: string;
	minutesAway: number | 'DUE' | 'ARR';
	isScheduled: boolean;
}

export interface RailAlertLine {
	id: string;
	name: string;
	bg: string;
	text: string;
}

export interface RailAlert {
	id: string;
	headline: string;
	description: string;
	impact: string;
	lines: RailAlertLine[];
}

export interface TransitData {
	buses: BusPrediction[];
	trains: TrainPrediction[];
	railAlerts: RailAlert[];
}
