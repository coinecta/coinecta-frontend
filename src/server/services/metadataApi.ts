import { mapAxiosErrorToTRPCError } from '@server/utils/mapErrors';
import { TRPCError } from '@trpc/server';
import axios from 'axios';
import { externalApi } from './tokenApiInstance';

type Signature = {
  publicKey: string;
  signature: string;
};

type MetadataField<T> = {
  sequenceNumber: number;
  signatures: Signature[];
  value: T;
};

interface TokenMetadata {
  subject: string; // base16-encoded policyId + base16-encoded assetName
  name: MetadataField<string>; // human-readable name for the subject
  description: MetadataField<string>; // human-readable description for the subject
  policy?: string; // base16-encoded CBOR representation of the monetary policy script
  ticker?: MetadataField<string>; // human-readable ticker name for the subject
  url?: MetadataField<string>; // HTTPS URL (web page relating to the token)
  logo?: MetadataField<string>; // PNG image file as a byte string
  decimals?: MetadataField<number>; // how many decimals to the token
}

export const metadataApi = {
  async postMetadataQuery(unit: string): Promise<TokenMetadata> {
    try {
      const response = await externalApi.get(`/metadata/${unit}`)
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
};