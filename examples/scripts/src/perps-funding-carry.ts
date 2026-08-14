import { createPublicClient } from '@polymarket/client';

    // Funding is settled hourly on all instruments, so a single hourly rate
    // annualises as rate * 24 * 365.
    const HOURS_PER_YEAR = 24 * 365;

    const client = createPublicClient();

    const tickers = await client.fetchPerpsTickers();

    const carry = tickers
    .map((ticker) => ({
      symbol: ticker.symbol,
      fundingRate: ticker.fundingRate,
      annualizedPct: (Number(ticker.fundingRate) * HOURS_PER_YEAR * 100).toFixed(2),
      openInterest: ticker.openInterest,
      nextFunding: new Date(ticker.nextFunding).toISOString(),
    }))
    .sort((a, b) => Number(b.annualizedPct) - Number(a.annualizedPct));

    console.log('Funding carry (positive = shorts pay longs):\n');
    console.table(carry);
    