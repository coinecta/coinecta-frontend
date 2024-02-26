import axios from "axios";
import { syncApi as api } from "./tokenApiInstance";
import { mapAxiosErrorToTRPCError } from "@server/utils/mapErrors";
import { TRPCError } from "@trpc/server";

export type StakeSummary = {
    poolStats: {
        [key: string]: StakeStats;
    }
    totalStats: StakeStats;
}

export type StakeStats = {
    totalPortfolio: number;
    totalVested: number;
    totalStaked: number;
    unclaimedTokens: number;
}

export type StakePosition = {
    name: string;
    total: number;
    unlockDate: string;
    initial: number;
    bonus: number;
    interest: number;
}

export const coinectaApi = {
    async postStakeSummary(stakeKeys: string[]): Promise<StakeSummary> {
      try {
        const response = await api.post('/stake/summary', stakeKeys)
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          throw mapAxiosErrorToTRPCError(error);
        }
        else {
          console.error(error)
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'An unknown error occurred' });
        }
      }
    },
    async postStakePositions(stakeKeys: string[]): Promise<StakePosition[]> {
      try {
        const response = await api.post('/stake/positions', stakeKeys)
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          throw mapAxiosErrorToTRPCError(error);
        }
        else {
          console.error(error)
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'An unknown error occurred' });
        }
      }
    }
  };