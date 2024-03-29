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
  totalPortfolio: string;
  totalVested: string;
  totalStaked: string;
  unclaimedTokens: string;
}

export type StakePosition = {
  name: string;
  total: string;
  unlockDate: string;
  initial: string;
  bonus: string;
  interest: number;
  txHash: string;
  txIndex: string;
}

export type StakePoolResponse = {
  amount: CardanoValue;
  stakePool: StakePoolDatum;
}

export type CardanoValue = {
  coin: string;
  multiAsset: {
    [policyId: string]: {
      [assetName: string]: string;
    };
  }
};

export type StakePoolDatum = {
  owner: CardanoCredential;
  rewardSettings: RewardSettings[];
}

export type CardanoCredential = {
  keyHash: string;
}

export type RewardSettings = {
  lockDuration: BigInt;
  rewardMultiplier: Rational;
}

export type Rational = {
  numerator: BigInt;
  denominator: BigInt;
}

export type AddStakeRequest = {
  stakePool: StakePoolIdentifier;
  ownerAddress: string;
  destinationAddress: string;
  rewardSettingIndex: number;
  walletUtxoListCbor: string[];
  amount: string;
}

export type FinalizeTxRequest = {
  unsignedTxCbor: string;
  txWitnessCbor: string;
}

export type StakePoolIdentifier = {
  address: string;
  ownerPkh: string;
  policyId: string;
  assetName: string;
}

export type StakeRequestsResponse = {
  total: number;
  data: StakeRequest[];
  extra: {
    slotData: { [slot: string]: number }
  }
}

export type StakeRequest = {
  slot: string;
  txHash: string;
  txIndex: string;
  amount: CardanoValue;
  status: number;
  stakePoolProxy: {
    lockTime: string;
  };
}

export type OutputReference = {
  txHash: string;
  index: string;
}

export type CancelStakeRequest = {
  stakeRequestOutputReference: OutputReference;
  walletUtxoListCbor: string[];
}

export type ClaimStakeRequest = {
  stakeUtxoOutputReferences: OutputReference[];
  walletUtxoListCbor: string[];
  changeAddress: string;
}

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
  async getStakePool(address: string, ownerPkh: string, policyId: string, assetName: string): Promise<StakePoolResponse> {
    try {
      const response = await syncApi.get(`/stake/pool/${address}/${ownerPkh}/${policyId}/${assetName}`)
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
  async getStakeRequests(walletAddresses: string[], page: number = 1, limit: number = 5): Promise<StakeRequestsResponse> {
    try {
      const response = await syncApi.post(`/stake/requests?page=${page}&limit=${limit}`, walletAddresses)
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
  async addStakeTx(request: AddStakeRequest): Promise<string> {
    try {
      const response = await syncApi.post('/transaction/stake/add', request)
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
  async claimStakeTx(request: ClaimStakeRequest): Promise<string> {
    try {
      const response = await syncApi.post('/transaction/stake/claim', request)
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
  async cancelStakeTx(request: CancelStakeRequest): Promise<string> {
    try {
      const response = await syncApi.post('/transaction/stake/cancel', request)
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
  async finalizeTx(request: FinalizeTxRequest): Promise<string> {
    try {
      const response = await syncApi.post('/transaction/finalize', request)
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
  baseURL: process.env.COINECTA_SYNC_API,
  headers: {
    'Content-type': 'application/json;charset=utf-8',
  }
});