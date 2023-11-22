import { prisma } from '@server/prisma';
import { TRPCError } from '@trpc/server';
import axios from 'axios';
import { createTRPCRouter, publicProcedure } from "../trpc";

const getPriceFromAPI = async () => {
  const response = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=cardano&vs_currencies=usd');
  return response.data.cardano.usd;
};

export const priceRouter = createTRPCRouter({
  getCardanoPrice: publicProcedure
    .query(async () => {
      try {
        // Check if the latest price in the database is older than 1 minute
        const oneMinuteAgo = new Date(new Date().getTime() - 60000);
        let latestPrice = await prisma.cardanoPrice.findFirst({
          orderBy: { updatedAt: 'desc' }
        });

        if (!latestPrice || latestPrice.updatedAt < oneMinuteAgo) {
          // Price is stale, fetch new price
          const newPrice = await getPriceFromAPI();
          latestPrice = await prisma.cardanoPrice.create({
            data: {
              price: newPrice
            }
          });
        }

        return latestPrice.price;
      } catch (error) {
        console.error('Error fetching Cardano price:', error);

        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          message: 'An unexpected error occurred while fetching the Cardano price',
          code: 'INTERNAL_SERVER_ERROR',
        });
      }
    }),
})