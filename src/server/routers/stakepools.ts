import { prisma } from '@server/prisma';
import { blockfrostAPI } from '@server/utils/blockfrostApi';
import { fetchAndUpdateStakepoolData } from '@server/utils/fetchAndUpdateStakepoolData';
import { TRPCError } from '@trpc/server';
import axios from 'axios';
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
  // getCurrentEpoch: publicProcedure
  //   .query(async () => {
  //     const { data: currentEpochData } = await blockfrostAPI.get(`/epochs/latest`);
  //     if (!currentEpochData) throw new Error("Unable to retrieve epoch data")
  //     return currentEpochData
  //   }),
  getCurrentStake: publicProcedure
    .input(z.object({
      rewardAddress: z.string().optional()
    }))
    .query(async ({ input, ctx }) => {
      try {
        let response = undefined

        if (input.rewardAddress) {
          response = await blockfrostAPI.get(`/accounts/${input.rewardAddress}`);
        } else {
          const userId = ctx?.session?.user.id;

          if (!userId) {
            throw new TRPCError({
              message: 'No user account and no reward address provided.',
              code: 'BAD_REQUEST'
            });
          }

          if (userId) {
            const user = await prisma.user.findFirst({
              where: {
                id: userId
              }
            });

            if (!user) {
              throw new TRPCError({
                message: 'Connected user account not found. ',
                code: 'NOT_FOUND'
              });
            }

            response = await blockfrostAPI.get(`/accounts/${user.rewardAddress}`);
          }
        }

        if (response) {
          const data: TUserAddressQuery = response.data
          return data;
        }
      } catch (error) {
        console.error(error);
        if (axios.isAxiosError(error)) {

          throw new TRPCError({
            message: `Failed to fetch data for user: ${error.message}`,
            code: 'INTERNAL_SERVER_ERROR'
          });
        }

        // For errors thrown by TRPCError directly
        if (error instanceof TRPCError) {
          throw error; // rethrow TRPCError errors directly
        }

        // Handle all other errors that may not have been caught by the above blocks
        throw new TRPCError({
          message: 'An unexpected error occurred',
          code: 'INTERNAL_SERVER_ERROR'
        });
      }
    }),
});