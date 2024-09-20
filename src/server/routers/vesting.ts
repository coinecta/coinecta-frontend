import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { coinectaVestingApi } from "@server/services/vestingApi";

export const vestingRouter = createTRPCRouter({
  createClaimTreasuryData: protectedProcedure
    .input(
      z.object({
        rootHash: z.string(),
        ownerAddress: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      return await coinectaVestingApi.createClaimTreasuryData(input);
    }),
  fetchClaimEntriesByAddress: protectedProcedure
    .input(
      z.object({
        addresses: z.array(z.string()),
      }),
    )
    .mutation(async ({ input }) => {
      return await coinectaVestingApi.fetchClaimEntriesByAddress(input);
    }),
  finalizeTransaction: protectedProcedure
    .input(
      z.object({
        unsignedTxCbor: z.string(),
        txWitnessCbor: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      return await coinectaVestingApi.finalizeTransaction(input);
    }),
  claimTreasury: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        ownerAddress: z.string(),
        updatedRootHash: z.string(),
        rawProof: z.string(),
        rawClaimEntry: z.string(),
        rawCollateralUtxo: z.string(),
        rawUtxos: z.array(z.string()),
      }),
    )
    .mutation(async ({ input }) => {
      return await coinectaVestingApi.claimTreasury(input);
    }),
  submitClaimTreasuryTransaction: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        ownerPkh: z.string(),
        utxoRaw: z.string(),
        txRaw: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      return await coinectaVestingApi.submitClaimTreasuryTransaction(input);
    }),
});
