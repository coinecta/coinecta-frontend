import axios from "axios";
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

// export type StakePool {

// }

export const coinectaSyncApi = {
    async getStakeSummary(stakeKeys: string[]): Promise<StakeSummary> {
      try {
        const response = await syncApi.post('/stake/summary', stakeKeys)
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
    async getStakePositions(stakeKeys: string[]): Promise<StakePosition[]> {
      try {
        const response = await syncApi.post('/stake/positions', stakeKeys)
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
    async getStakePoolByAddressOwner(address: string, ownerPkh: string): Promise<void> {
      try {
        const response = await syncApi.get(`/stake/pools/${address}/${ownerPkh}`)
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


export const syncApi = axios.create({
  baseURL: `http://localhost:5232`,
  headers: {
    'Content-type': 'application/json;charset=utf-8',
  }
});