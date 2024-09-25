import { mapAxiosErrorToTRPCError } from "@server/utils/mapErrors";
import { TRPCError } from "@trpc/server";
import axios from "axios";

export type ClaimEntriesRequest = {
  addresses: string[];
};

export type ClaimEntriesResponse = {
  id: string;
  rootHash: string;
  claimantPkh: string;
  vestingValue?: {
    [key: string]: {
      [key: string]: number;
    };
  };
  directValue?: {
    [key: string]: {
      [key: string]: number;
    };
  };
};

export type ClaimTreasuryDataRequest = {
  rootHash: string;
  ownerAddress: string;
};

export type ClaimTreasuryDataResponse = {
  updatedRootHash: string;
  rawProof: string;
  rawClaimEntry: string;
};

export type ClaimTreasuryRequest = {
  id: string;
  ownerAddress: string;
  updatedRootHash: string;
  rawProof: string;
  rawClaimEntry: string;
  rawCollateralUtxo: string;
  rawUtxos: string[];
};

export type ClaimTreasuryResponse = {
  unsignedTxRaw: string;
  treasuryUtxoRaw: string;
};

export type FinalizeTransactionRequest = {
  unsignedTxCbor: string;
  txWitnessCbor: string;
};

export type FinalizeTransactionResponse = {
  txHash: string;
};

export type SubmitClaimTreasuryTransactionRequest = {
  id: string;
  ownerPkh: string;
  utxoRaw: string;
  txRaw: string;
};

export type SubmitClaimTreasuryTransactionResponse = {
  txHash: string;
};

export const coinectaVestingApi = {
  async finalizeTransaction(
    request: FinalizeTransactionRequest,
  ): Promise<FinalizeTransactionResponse> {
    try {
      const response = await vestingApi.post(
        "/api/v1/transaction/finalize",
        request,
      );
      return { txHash: response.data } as FinalizeTransactionResponse;
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
  async createClaimTreasuryData(
    request: ClaimTreasuryDataRequest,
  ): Promise<ClaimTreasuryDataResponse> {
    try {
      const response = await vestingApi.put(
        `/api/v1/treasury/claim?rootHash=${request.rootHash}&ownerAddress=${request.ownerAddress}`,
      );
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
  async fetchClaimEntriesByAddress(
    request: ClaimEntriesRequest,
  ): Promise<ClaimEntriesResponse[]> {
    try {
      const response = await vestingApi.post(
        "/api/v1/treasury/claim/entries",
        request.addresses,
      );
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
  },
  async claimTreasury(
    request: ClaimTreasuryRequest,
  ): Promise<ClaimTreasuryResponse> {
    try {
      const response = await vestingApi.post(
        "/api/v1/transaction/treasury/claim",
        request,
      );
      return response.data as ClaimTreasuryResponse;
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
  async submitClaimTreasuryTransaction(
    request: SubmitClaimTreasuryTransactionRequest,
  ): Promise<SubmitClaimTreasuryTransactionResponse> {
    try {
      const response = await vestingApi.post(
        "/api/v1/transaction/treasury/claim/submit",
        request,
      );
      return response.data as SubmitClaimTreasuryTransactionResponse;
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
};

export const vestingApi = axios.create({
  baseURL: process.env.COINECTA_VESTING_API,
  headers: {
    "Content-type": "application/json;charset=utf-8",
  },
});
