import { BASE_MAINNET, ERC20_ABI, ETHEREUM_MAINNET, POLYGON_MAINNET } from '@lib/constants/evm';
import { ethers } from 'ethers';
import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from "../trpc";

export const evmRouter = createTRPCRouter({
  prepareTokenTransfer: publicProcedure
    .input(z.object({
      tokenAddress: z.string(),
      recipientAddress: z.string(),
      amount: z.string(),
      decimals: z.number(),
      chainId: z.number()
    }))
    .mutation(async ({ input }) => {
      const rpcUrl = getRpcUrlForChain(input.chainId);
      const provider = new ethers.JsonRpcProvider(rpcUrl);
      const tokenContract = new ethers.Contract(input.tokenAddress, ERC20_ABI, provider);
      const tokenAmount = ethers.parseUnits(input.amount, input.decimals);
      const unsignedTx = await tokenContract.transfer(input.recipientAddress, tokenAmount);

      return {
        to: unsignedTx.to,
        data: unsignedTx.data,
        value: unsignedTx.value,
        gasLimit: unsignedTx.gasLimit,
        chainId: input.chainId,
      };
    }),

  waitForTransactionReceipt: publicProcedure
    .input(z.object({
      transactionHash: z.string(),
      chainId: z.number(),
    }))
    .query(async ({ input }) => {
      const rpcUrl = getRpcUrlForChain(input.chainId)
      const provider = new ethers.JsonRpcProvider(rpcUrl);
      const receipt = await provider.waitForTransaction(input.transactionHash);
      return receipt;
    }),

  prepareNativeTransfer: publicProcedure
    .input(z.object({
      recipientAddress: z.string(),
      amount: z.string(),
      chainId: z.number()
    }))
    .mutation(async ({ input }) => {
      const rpcUrl = getRpcUrlForChain(input.chainId);
      const provider = new ethers.JsonRpcProvider(rpcUrl);

      const unsignedTx = {
        to: input.recipientAddress,
        value: ethers.parseEther(input.amount),
      };

      const estimatedGas = await provider.estimateGas(unsignedTx);

      return {
        ...unsignedTx,
        gasLimit: estimatedGas,
        chainId: input.chainId,
      };
    })
});

// Helper function to get RPC URL based on chain ID
function getRpcUrlForChain(chainId: number): string {
  switch (chainId) {
    case 1:
      return ETHEREUM_MAINNET.rpcUrl || '';
    case 137:
      return POLYGON_MAINNET.rpcUrl || '';
    case 8453:
      return BASE_MAINNET.rpcUrl || '';
    // Add more chains as needed
    default:
      throw new Error(`Unsupported chain ID: ${chainId}`);
  }
}