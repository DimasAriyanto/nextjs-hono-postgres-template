import { InternalError, ValidationError } from '@/server/errors';
import type { TConvertCurrencyResponse } from '@/contracts';

const OXR_LATEST_URL = 'https://openexchangerates.org/api/latest.json';

// The free Open Exchange Rates tier only serves rates against a USD base —
// cross rates for any other pair are derived from this table.
const CACHE_TTL_MS = 55 * 60 * 1000; // OXR updates hourly; refresh a bit before that

interface RatesSnapshot {
	base: 'USD';
	rates: Record<string, number>;
	asOf: string;
}

let cache: RatesSnapshot | null = null;
let inflight: Promise<RatesSnapshot> | null = null;

async function fetchLatestRates(): Promise<RatesSnapshot> {
	const appId = process.env.OPEN_EXCHANGE_RATES_APP_ID;
	if (!appId) {
		throw new InternalError('Currency conversion is not configured (missing OPEN_EXCHANGE_RATES_APP_ID)');
	}

	const url = `${OXR_LATEST_URL}?app_id=${appId}`;
	let res: Response;
	try {
		res = await fetch(url);
	} catch (err) {
		throw new InternalError('Failed to reach exchange rate provider', err);
	}

	if (!res.ok) {
		const body = await res.json().catch(() => null);
		throw new InternalError('Exchange rate provider returned an error', body);
	}

	const data = (await res.json()) as { base: 'USD'; rates: Record<string, number>; timestamp: number };

	return {
		base: data.base,
		rates: data.rates,
		asOf: new Date(data.timestamp * 1000).toISOString(),
	};
}

async function getRatesSnapshot(): Promise<RatesSnapshot> {
	if (cache && Date.now() - Date.parse(cache.asOf) < CACHE_TTL_MS) {
		return cache;
	}

	// Coalesce concurrent misses into a single upstream call
	if (!inflight) {
		inflight = fetchLatestRates()
			.then((snapshot) => {
				cache = snapshot;
				return snapshot;
			})
			.finally(() => {
				inflight = null;
			});
	}

	return inflight;
}

function rateFor(rates: Record<string, number>, code: string): number {
	const rate = rates[code];
	if (rate === undefined) {
		throw new ValidationError('Unsupported currency code', { currency: [`"${code}" is not a supported currency`] });
	}
	return rate;
}

export const currencyService = {
	/**
	 * Exchange rate to convert 1 unit of `from` into `to`, derived from the
	 * cached USD-base rate table (refreshed at most once per CACHE_TTL_MS).
	 */
	async getRate(from: string, to: string): Promise<{ rate: number; asOf: string }> {
		const snapshot = await getRatesSnapshot();

		if (from === to) {
			return { rate: 1, asOf: snapshot.asOf };
		}

		const fromRate = from === snapshot.base ? 1 : rateFor(snapshot.rates, from);
		const toRate = to === snapshot.base ? 1 : rateFor(snapshot.rates, to);

		return { rate: toRate / fromRate, asOf: snapshot.asOf };
	},

	async convert(amount: number, from: string, to: string): Promise<TConvertCurrencyResponse> {
		const { rate, asOf } = await this.getRate(from, to);

		return {
			from,
			to,
			amount,
			rate,
			converted: amount * rate,
			as_of: asOf,
		};
	},
};
