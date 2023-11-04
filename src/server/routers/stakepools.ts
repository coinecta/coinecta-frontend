import { prisma } from '@server/prisma';
import { blockfrostAPI } from '@server/utils/blockfrostApi';
import { fetchAndUpdateStakepoolData } from '@server/utils/fetchAndUpdateStakepoolData';
import crypto from 'crypto';
import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from "../trpc";

export type TStakepoolInfoReturn = {
  successfulStakePools: TStakePoolWithStats[];
  errors: ({
    identifier: string;
    error: any;
  } | {
    pool_id: any;
    error: any;
  })[]
}

export const stakepoolRouter = createTRPCRouter({
  stakepoolInfo: publicProcedure
    .input(z.object({
      stakepoolIds: z.array(z.string())
    }))
    .mutation(async ({ input }) => {
      const stakepoolIds = input.stakepoolIds.sort(); // sort to maintain consistent order
      const spoListKey = crypto.createHash('sha256').update(stakepoolIds.join('|')).digest('hex'); // create a unique hash for the list of stakepools
      const cacheExpiryMinutes = 10;
      const staleTime = new Date(Date.now() - cacheExpiryMinutes * 60 * 1000);

      // Check if we have non-stale cache for this spoListKey
      const cachedData = await prisma.stakepoolDataCache.findUnique({
        where: { spoListKey },
      });

      if (cachedData) {
        if (cachedData.updatedAt > staleTime) {
          // If valid cache exists and it's not stale, return the cached data
          return cachedData.data as unknown as TStakepoolInfoReturn;
        } else {
          // Cache is stale. Mark it as "being updated" by setting the updatedAt timestamp.
          await prisma.stakepoolDataCache.update({
            where: { spoListKey },
            data: { updatedAt: new Date() }, // This timestamp update should be immediate
          });

          // Initiate an update but don't await it
          fetchAndUpdateStakepoolData(stakepoolIds).then(freshData => {
            // Update the cache once the fresh data is fetched
            prisma.stakepoolDataCache.update({
              where: { spoListKey },
              data: { data: freshData }, // Here, we're not updating the timestamp because it was already set
            }).catch(error => {
              console.error('Failed to update cache:', error);
            });
          }).catch(error => {
            console.error('Failed to fetch fresh data:', error);
          });

          // Return the stale data immediately (since await wasn't used)
          return cachedData.data as unknown as TStakepoolInfoReturn
        }
      } else {
        // If no cache exists, fetch new data, wait for it, update the cache, and return the data
        const freshData = await fetchAndUpdateStakepoolData(stakepoolIds);
        await prisma.stakepoolDataCache.upsert({
          where: {
            spoListKey: spoListKey,
          },
          update: {
            data: freshData,
            updatedAt: new Date(),
          },
          create: {
            spoListKey: spoListKey,
            data: freshData,
            updatedAt: new Date(),
          },
        });
        return freshData as TStakepoolInfoReturn;
      }
    }),
  getStakepoolsWithFiso: publicProcedure
    .input(z.object({
      stakepoolIds: z.array(z.string())
    }))
    .query(async ({ input }) => {
      const { stakepoolIds } = input;

      const stakepools = await prisma.stakepool.findMany({
        where: {
          pool_id: {
            in: stakepoolIds,
          },
        },
        include: {
          fisoPools: true
        }
      });

      return stakepools;
    }),
  getCurrentEpoch: publicProcedure
    .query(async () => {
      const { data: currentEpochData } = await blockfrostAPI.get(`/epochs/latest`);
      if (!currentEpochData) throw new Error("Unable to retrieve epoch data")
      return currentEpochData
    })
});