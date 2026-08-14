import { createPublicClient } from '@polymarket/client';

    const client = createPublicClient();

    const instruments = await client.fetchPerpsInstruments();

    console.log(`${instruments.length} perpetual instruments\n`);

    console.table(
    instruments.slice(0, 15).map((instrument) => ({
      id: instrument.id,
      symbol: instrument.symbol,
    })),
    );
    