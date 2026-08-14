import { createPublicClient, PerpsKlineInterval } from '@polymarket/client';
    import { never } from './lib/assert';

    const client = createPublicClient();

    const [instrument] = await client.fetchPerpsInstruments();
    if (!instrument) never('No perpetual instruments available');

    const page = await client
    .listPerpsCandles({
      instrumentId: instrument.id,
      interval: PerpsKlineInterval.OneHour,
    })
    .firstPage();

    console.log(`${instrument.symbol} — ${page.items.length} hourly candles\n`);

    console.table(
    page.items.slice(-10).map((candle) => ({
      time: new Date(candle.timestamp).toISOString(),
      open: candle.open,
      high: candle.high,
      low: candle.low,
      close: candle.close,
      volume: candle.volume,
      trades: candle.trades,
    })),
    );
    