import { ctaConfig } from './config';
import type { BusPrediction, RailAlert, TrainPrediction } from '$lib/types';

interface BusPredictionRaw {
	stpid: string;
	stpnm: string;
	rt: string;
	des: string;
	prdctdn: string;
}

interface BusTrackerResponse {
	'bustime-response': {
		prd?: BusPredictionRaw[];
		error?: { stpid?: string; msg: string }[];
	};
}

interface TrainEtaRaw {
	staId: string;
	staNm: string;
	rt: string;
	destNm: string;
	arrT: string;
	prdt: string;
	isApp: string;
	isDly: string;
	isSch: string;
}

interface TrainTrackerResponse {
	ctatt: {
		errCd: string;
		errNm?: string | null;
		eta?: TrainEtaRaw[];
	};
}

function minutesAwayFromTimes(prdt: string, arrT: string, isApp: string): number | 'DUE' {
	if (isApp === '1') return 'DUE';
	const diffMs = new Date(arrT).getTime() - new Date(prdt).getTime();
	const minutes = Math.round(diffMs / 60000);
	return minutes <= 0 ? 'DUE' : minutes;
}

function toSortValue(m: number | 'DUE' | 'ARR'): number {
	return m === 'DUE' || m === 'ARR' ? 0 : m;
}

export async function fetchBusPredictions(): Promise<BusPrediction[]> {
	const { busTrackerKey, busStops } = ctaConfig();
	const url = new URL('http://www.ctabustracker.com/bustime/api/v2/getpredictions');
	url.searchParams.set('key', busTrackerKey);
	url.searchParams.set('stpid', busStops.join(','));
	url.searchParams.set('format', 'json');

	const res = await fetch(url);
	if (!res.ok) throw new Error(`CTA BusTracker request failed (${res.status})`);
	const data = (await res.json()) as BusTrackerResponse;

	const predictions = data['bustime-response']?.prd ?? [];
	return predictions
		.map((p) => ({
			stopId: p.stpid,
			stopName: p.stpnm,
			route: p.rt,
			destination: p.des,
			minutesAway: (p.prdctdn === 'DUE' ? 'DUE' : Number.parseInt(p.prdctdn, 10)) as number | 'DUE'
		}))
		.sort((a, b) => toSortValue(a.minutesAway) - toSortValue(b.minutesAway));
}

export async function fetchTrainPredictions(): Promise<TrainPrediction[]> {
	const { trainTrackerKey, trainStations } = ctaConfig();
	const url = new URL('http://lapi.transitchicago.com/api/1.0/ttarrivals.aspx');
	url.searchParams.set('key', trainTrackerKey);
	url.searchParams.set('mapid', trainStations.join(','));
	url.searchParams.set('outputType', 'JSON');

	const res = await fetch(url);
	if (!res.ok) throw new Error(`CTA TrainTracker request failed (${res.status})`);
	const data = (await res.json()) as TrainTrackerResponse;

	if (data.ctatt.errCd !== '0' && !data.ctatt.eta) {
		throw new Error(`CTA TrainTracker error: ${data.ctatt.errNm ?? data.ctatt.errCd}`);
	}

	const etas = data.ctatt.eta ?? [];
	return etas
		.map((e) => ({
			stationId: e.staId,
			stationName: e.staNm,
			line: e.rt,
			destination: e.destNm,
			minutesAway: minutesAwayFromTimes(e.prdt, e.arrT, e.isApp),
			isScheduled: e.isSch === '1'
		}))
		.sort((a, b) => toSortValue(a.minutesAway) - toSortValue(b.minutesAway));
}

const RAIL_ROUTE_IDS = ['Red', 'Blue', 'Brn', 'G', 'Org', 'P', 'Pink', 'Y'];

// Categories confirmed (via live testing) to be routine/informational rather
// than an actual service disruption — everything else is treated as alert-worthy.
const NOISE_SEVERITIES = new Set(['planned', 'special-note', 'normal']);

interface AlertServiceRaw {
	ServiceType: string;
	ServiceName: string;
	ServiceId: string;
	ServiceBackColor: string;
	ServiceTextColor: string;
}

interface AlertRaw {
	AlertId: string;
	Headline: string;
	ShortDescription: string;
	Impact: string;
	SeverityCSS: string;
	ImpactedService?: { Service: AlertServiceRaw | AlertServiceRaw[] };
}

interface CtaAlertsResponse {
	CTAAlerts: {
		ErrorCode: string;
		ErrorMessage: string | null;
		Alert?: AlertRaw | AlertRaw[];
	};
}

function asArray<T>(value: T | T[] | undefined): T[] {
	if (!value) return [];
	return Array.isArray(value) ? value : [value];
}

export async function fetchRailAlerts(): Promise<RailAlert[]> {
	const url = new URL('https://www.transitchicago.com/api/1.0/alerts.aspx');
	url.searchParams.set('outputType', 'JSON');
	url.searchParams.set('activeonly', 'true');
	url.searchParams.set('routeid', RAIL_ROUTE_IDS.join(','));

	const res = await fetch(url);
	if (!res.ok) throw new Error(`CTA alerts request failed (${res.status})`);
	const data = (await res.json()) as CtaAlertsResponse;

	if (data.CTAAlerts.ErrorCode !== '0') {
		throw new Error(`CTA alerts error: ${data.CTAAlerts.ErrorMessage ?? data.CTAAlerts.ErrorCode}`);
	}

	return asArray(data.CTAAlerts.Alert)
		.filter((a) => !NOISE_SEVERITIES.has(a.SeverityCSS))
		.map((a) => ({
			id: a.AlertId,
			headline: a.Headline,
			description: a.ShortDescription,
			impact: a.Impact,
			lines: asArray(a.ImpactedService?.Service)
				.filter((s) => s.ServiceType === 'R')
				.map((s) => ({
					id: s.ServiceId,
					name: s.ServiceName,
					bg: `#${s.ServiceBackColor}`,
					text: `#${s.ServiceTextColor}`
				}))
		}))
		.filter((a) => a.lines.length > 0);
}
