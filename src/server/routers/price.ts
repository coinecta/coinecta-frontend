import { COINGECKO_IDS } from '@lib/currencies';
import { prisma } from '@server/prisma';
import axios from 'axios';
import z from 'zod';
import { createTRPCRouter, publicProcedure } from "../trpc";

export const priceRouter = createTRPCRouter({
  getCardanoPrice: publicProcedure
    .query(async () => {
      const oneMinuteAgo = new Date(new Date().getTime() - 60000);

      const latestPriceEntry = await prisma.cardanoPrice.findUnique({
        where: { id: 1 },
      });

      // Check if the price is stale
      if (!latestPriceEntry || latestPriceEntry.updatedAt < oneMinuteAgo) {
        // Price is stale, fetch new price from the API
        const newPrice = await getPriceFromAPI();

        await prisma.cardanoPrice.upsert({
          where: { id: 1 },
          update: { price: newPrice },
          create: { id: 1, price: newPrice },
        });

        return newPrice;
      } else {
        // Price is not stale, return the existing price
        return latestPriceEntry.price;
      }
    }),
  getCardanoPriceHistory: publicProcedure
    .input(z.object({
      startDate: z.date(),
      endDate: z.date(),
    }))
    .query(async ({ input }) => {
      const priceHistory = await getPriceHistory(input.startDate, input.endDate);
      return priceHistory;
    }),

  getTokenPrices: publicProcedure
    .input(z.array(z.string()))
    .query(async ({ input: tokenSymbols }) => {
      const oneMinuteAgo = new Date(new Date().getTime() - 60000);
      const geckoIds = getGeckoIdsFromSymbols(tokenSymbols);
      const geckoIdToSymbolMap = mapGeckoIdsToSymbols(tokenSymbols);
      // Fetch all existing prices from the database
      const existingPrices = await prisma.tokenUsdPrice.findMany();
      const existingGeckoIds = existingPrices.map(item => item.geckoId)

      // Determine which prices are stale or missing
      const stalePrices = existingPrices.filter(entry => entry.updatedAt < oneMinuteAgo);
      const missingGeckoIds = geckoIds.filter(id => !existingPrices.find(entry => entry.geckoId === id));

      let newPrices: Record<string, { usd: number }> = {};

      // If there are stale or missing prices, fetch all prices in one API call
      // Fetching all new prices in one API call is to avoid being rate-limited by coingecko's API
      // So regardless of when users do the query, we will only ever call coingecko once per minute
      if (stalePrices.length > 0 || missingGeckoIds.length > 0) {
        try {
          newPrices = await getTokenPricesFromAPI([...missingGeckoIds, ...existingGeckoIds]);

          // Only upsert if we successfully got new prices
          if (Object.keys(newPrices).length > 0) {
            const upsertPromises = Object.entries(newPrices).map(([geckoId, priceData]) =>
              prisma.tokenUsdPrice.upsert({
                where: { geckoId },
                update: { price: priceData.usd },
                create: {
                  geckoId,
                  price: priceData.usd
                },
              })
            );
            await Promise.all(upsertPromises);
          }
        } catch (error) {
          console.error('Error fetching prices from API:', error);
          // In case of error, we'll use existing prices, even if they're stale
        }
      }

      // Combine fresh existing prices with new prices
      const result: Record<string, { usd: number }> = {};
      for (const geckoId of geckoIds) {
        const symbol = geckoIdToSymbolMap[geckoId];
        if (symbol) {
          if (newPrices[geckoId]) {
            result[symbol] = { usd: newPrices[geckoId].usd };
          } else {
            const existingPrice = existingPrices.find(entry => entry.geckoId === geckoId);
            if (existingPrice) {
              result[symbol] = { usd: existingPrice.price };
            }
          }
        }
      }

      return result;
    }),

  getTokenPriceHistory: publicProcedure
    .input(z.object({
      tokenId: z.string(),
      startDate: z.date(),
      endDate: z.date(),
    }))
    .query(async ({ input }) => {
      const priceHistory = await getTokenPriceHistory(input.tokenId, input.startDate, input.endDate);
      return priceHistory;
    })
})





const getGeckoIdFromSymbol = (symbol: string): string | undefined => {
  const lowercaseSymbol = symbol.toLowerCase();
  const tokenInfo = COINGECKO_IDS.find(token =>
    token.tokenAliases.some(alias => alias.toLowerCase() === lowercaseSymbol)
  );
  return tokenInfo?.geckoId;
};

const getGeckoIdsFromSymbols = (symbols: string[]): string[] => {
  return symbols.map(symbol => {
    const lowercaseSymbol = symbol.toLowerCase();
    const tokenInfo = COINGECKO_IDS.find(token =>
      token.tokenAliases.some(alias => alias.toLowerCase() === lowercaseSymbol)
    );
    return tokenInfo?.geckoId;
  }).filter((id): id is string => id !== undefined);
};

const mapGeckoIdsToSymbols = (symbols: string[]): Record<string, string> => {
  return symbols.reduce((idToSymbolMap, symbol) => {
    const geckoId = getGeckoIdFromSymbol(symbol);
    if (geckoId) {
      idToSymbolMap[geckoId] = symbol;
    }
    return idToSymbolMap;
  }, {} as Record<string, string>);
};


const getPriceFromAPI = async () => {
  const response = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=cardano&vs_currencies=usd');
  return response.data.cardano.usd;
};

// https://api.coingecko.com/api/v3/coins/cardano/market_chart/range?vs_currency=usd&from=1671069018&to=1702576218&precision=2
// Data granularity is automatic (cannot be adjusted)
// 1 day from current time = 5 minute interval data
// 2 - 90 days of date range = hourly data
// above 90 days of date range = daily data (00:00 UTC)

const getPriceHistory = async (startDate: Date, endDate: Date) => {
  const startTimestamp = Math.floor(startDate.getTime() / 1000);
  const endTimestamp = Math.floor(endDate.getTime() / 1000);

  const response = await axios.get(`https://api.coingecko.com/api/v3/coins/cardano/market_chart/range`, {
    params: {
      vs_currency: 'usd',
      from: startTimestamp,
      to: endTimestamp,
      precision: 2
    }
  });

  const prices: number[][] = response.data.prices;
  let dailyPrices = [];
  let processedDates = new Set();

  for (let i = 0; i < prices.length; i++) {
    const timestamp = prices[i][0];
    const price = prices[i][1];
    const date = new Date(timestamp);

    // Format date to YYYY-MM-DD to easily check if it's already processed
    const formattedDate = date.toISOString().split('T')[0];

    if (!processedDates.has(formattedDate)) {
      dailyPrices.push({ date: new Date(formattedDate), price });
      processedDates.add(formattedDate);
    }
  }

  return dailyPrices;
};

const getTokenPricesFromAPI = async (tokenIds: string[]): Promise<Record<string, { usd: number }>> => {
  try {
    const response = await axios.get('https://api.coingecko.com/api/v3/simple/price', {
      params: {
        ids: tokenIds.join(','),
        vs_currencies: 'usd'
      }
    });

    console.log(`Fetching prices from coingecko for ${tokenIds.length} tokens`);

    // Validate the response data
    if (typeof response.data === 'object' && Object.keys(response.data).length > 0) {
      return response.data;
    } else {
      throw new Error('Invalid or empty response from API');
    }
  } catch (error) {
    console.error('Error fetching prices from API:', error);
    return {};
  }
};

const getTokenPriceHistory = async (tokenId: string, startDate: Date, endDate: Date) => {
  const startTimestamp = Math.floor(startDate.getTime() / 1000);
  const endTimestamp = Math.floor(endDate.getTime() / 1000);
  const response = await axios.get(`https://api.coingecko.com/api/v3/coins/${tokenId}/market_chart/range`, {
    params: {
      vs_currency: 'usd',
      from: startTimestamp,
      to: endTimestamp,
      precision: 2
    }
  });
  const prices: number[][] = response.data.prices;
  let dailyPrices = [];
  let processedDates = new Set();
  for (let i = 0; i < prices.length; i++) {
    const timestamp = prices[i][0];
    const price = prices[i][1];
    const date = new Date(timestamp);
    const formattedDate = date.toISOString().split('T')[0];
    if (!processedDates.has(formattedDate)) {
      dailyPrices.push({ date: new Date(formattedDate), price });
      processedDates.add(formattedDate);
    }
  }
  return dailyPrices;
};
