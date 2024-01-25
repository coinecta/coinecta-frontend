import { getTokenInfo } from '@server/services/xerberusApi';
import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from "../trpc";

export const xerberusRouter = createTRPCRouter({
  getSpecificTokenInfo: publicProcedure
    .input(z.object({
      token: z.string()
    }))
    .query(async ({ input }) => {
      return await getTokenInfo(input.token);
    })
})