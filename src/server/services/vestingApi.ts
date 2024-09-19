import { mapAxiosErrorToTRPCError } from "@server/utils/mapErrors";
import { TRPCError } from "@trpc/server";
import axios from "axios";

export type ClaimEntriesRequest = {
  addresses: string[];
}

export type ClaimEntriesResponse = {
  rootHash: string;
  claimantPkh: string;
  vestingValue: number;
  directValue: number;
}

export type ClaimTreasuryDataRequest = {
  rootHash: string;
  ownerAddress: string;
}

export type ClaimTreasuryDataResponse = {
  updatedRootHash: string;
  rawProof: string;
  rawClaimEntry: string;
}

export const coinectaVestingApi = {
  async createClaimTreasuryData(request: ClaimTreasuryDataRequest): Promise<ClaimTreasuryDataResponse> {
    try {
      const response = await vestingApi.put(`/api/v1/treasury/claim?rootHash=${request.rootHash}&ownerAddress=${request.ownerAddress}`);
      return response.data as ClaimTreasuryDataResponse;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: error.response?.data ?? "An unknown error occurred",
        });
      } else {
        console.error(error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "An unknown error occurred",
        });
      }
    }
  },
  async fetchClaimEntriesByAddress(request: ClaimEntriesRequest): Promise<ClaimEntriesResponse[]> {
    try {
      const response = await vestingApi.post("/api/v1/treasury/claimentries", request.addresses);
      return response.data as ClaimEntriesResponse[];
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: error.response?.data ?? "An unknown error occurred",
        });
      } else {
        console.error(error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "An unknown error occurred",
        });
      }
    }
  }
}

export const vestingApi = axios.create({
  baseURL: process.env.COINECTA_VESTING_API,
  headers: {
    "Content-type": "application/json;charset=utf-8",
  },
});