import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { coinectaVestingApi } from "@server/services/vestingApi";

export const vestingRouter = createTRPCRouter({
    createClaimTreasuryData: protectedProcedure
    .input(z.object({
      rootHash: z.string(),
      ownerAddress: z.string(),
    }))
    .mutation(async ({ input }) => {
      return await coinectaVestingApi.createClaimTreasuryData(input);
    }),
    fetchClaimEntriesByAddress: protectedProcedure
    .input(z.object({
        addresses: z.array(z.string())
    }))
    .mutation(async ({ input }) => {
      return await coinectaVestingApi.fetchClaimEntriesByAddress(input);
    }),
})