import { metadataApi } from '@server/services/metadataApi';
import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from "../trpc";

export const tokensRouter = createTRPCRouter({
  getMetadata: publicProcedure
    .input(z.object({
      unit: z.string()
    }))
    .query(async ({ input }) => {
      const { unit } = input;
      return await metadataApi.postMetadataQuery(unit);
    })
})