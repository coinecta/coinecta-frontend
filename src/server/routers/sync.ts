import { coinectaSyncApi } from "@server/services/syncApi";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const syncRouter = createTRPCRouter({
  getStakeSummary: protectedProcedure
    .input(z.array(z.string()))
    .query(async ({ input }) => {
      return await coinectaSyncApi.getStakeSummary(input);
    }),
  getStakePositions: protectedProcedure
    .input(z.array(z.string()))
    .query(async ({ input }) => {
      return await coinectaSyncApi.getStakePositions(input);
    }),
  getStakePool: protectedProcedure
    .input(z.object({
      address: z.string(),
      ownerPkh: z.string(),
      policyId: z.string(),
      assetName: z.string(),
    }))
    .query(async ({ input }) => {
      const { address, ownerPkh, policyId, assetName } = input;
      return await coinectaSyncApi.getStakePool(
        address,
        ownerPkh,
        policyId,
        assetName,
      );
    }),
  getStakeRequests: protectedProcedure
    .input(z.object({
      walletAddresses: z.array(z.string()),
      page: z.number().optional(),
      limit: z.number().optional(),
    }))
    .query(async ({ input }) => {
      const { walletAddresses, page, limit } = input;
      return await coinectaSyncApi.getStakeRequests(
        walletAddresses,
        page,
        limit,
      );
    }),
  getRawUtxos: protectedProcedure
    .input(z.string())
    .query(async ({ input }) => {
      return await coinectaSyncApi.getRawUtxos(input);
    }),
  addStakeTx: protectedProcedure
    .input(z.object({
      stakePool: z.object({
        address: z.string(),
        ownerPkh: z.string(),
        policyId: z.string(),
        assetName: z.string(),
      }),
      ownerAddress: z.string(),
      destinationAddress: z.string(),
      rewardSettingIndex: z.number(),
      walletUtxoListCbor: z.array(z.string()),
      amount: z.string(),
    }))
    .mutation(async ({ input }) => {
      return await coinectaSyncApi.addStakeTx(input);
    }),
  claimStakeTx: protectedProcedure
    .input(z.object({
      stakeUtxoOutputReferences: z.array(z.object({
        txHash: z.string(),
        index: z.string(),
      })),
      walletUtxoListCbor: z.array(z.string()),
      changeAddress: z.string(),
    }))
    .mutation(async ({ input }) => {
      return await coinectaSyncApi.claimStakeTx(input);
    }),
  cancelStakeTx: protectedProcedure
    .input(z.object({
      stakeRequestOutputReference: z.object({
        txHash: z.string(),
        index: z.string(),
      }),
      walletUtxoListCbor: z.array(z.string()),
    }))
    .mutation(async ({ input }) => {
      return await coinectaSyncApi.cancelStakeTx(input);
    }),
  finalizeTx: protectedProcedure
    .input(z.object({
      unsignedTxCbor: z.string(),
      txWitnessCbor: z.string(),
    }))
    .mutation(async ({ input }) => {
      return await coinectaSyncApi.finalizeTx(input);
    }),
});
