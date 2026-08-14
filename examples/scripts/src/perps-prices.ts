import { createPublicClient } from '@polymarket/client';
    import { never } from './lib/assert';

    const client = createPublicClient();

    const [instrument] = await client.fetchPerpsInstruments();
    if (!instrument) never('No perpetual instruments available');

    const [tickers, book, fees] = await Promise.all([
    client.fetchPerpsTickers({ instrumentId: instrument.id }),
    client.fetchPerpsBook({ instrumentId: instrument.id }),
    client.fetchPerpsFees(),
    ]);

    const ticker = tickers[0] ?? never('No ticker for instrument');

    console.table({
    symbol: ticker.symbol,
    markPrice: ticker.markPrice,
    indexPrice: ticker.indexPrice,
    midPrice: ticker.midPrice,
    lastPrice: ticker.lastPrice,
    fundingRate: ticker.fundingRate,
    openInterest: ticker.openInterest,
    nextFunding: new Date(ticker.nextFunding).toISOString(),
    bids: book.bids.length,
    asks: book.asks.length,
    });

    console.log('\nFee schedule:');
    console.table(fees);
    