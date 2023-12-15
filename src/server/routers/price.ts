import { prisma } from '@server/prisma';
import axios from 'axios';
import z from 'zod';
import { createTRPCRouter, publicProcedure } from "../trpc";

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
    })
})