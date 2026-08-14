import { createPublicClient } from '@polymarket/client';

    // Basis = mark price minus index price. A positive basis means the perp
    // trades at a premium to the oracle index (long demand); a negative basis
    // means a discount (short pressure).
    const client = createPublicClient();

    const tickers = await client.fetchPerpsTickers();

    const basis = tickers
    .map((ticker) => {
      const mark = Number(ticker.markPrice);
      const index = Number(ticker.indexPrice);
      return {
        symbol: ticker.symbol,
        markPrice: ticker.markPrice,
        indexPrice: ticker.indexPrice,
        basis: (mark - index).toFixed(6),
        basisPct: index === 0 ? 'N/A' : (((mark - index) / index) * 100).toFixed(4),
      };
    })
    .sort((a, b) => Math.abs(Number(b.basisPct)) - Math.abs(Number(a.basisPct)));

    console.table(basis);
    