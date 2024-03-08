import { trpc } from "@lib/utils/trpc";
import { metadataApi } from "@server/services/metadataApi";
import { useEffect, useMemo, useState } from "react";

export const useToken = () => {
    const DEFAULT_CNCT_DECIMALS = parseInt(process.env.DEFAULT_CNCT_DECIMALS!);
    const STAKE_POOL_ASSET_POLICY = process.env.STAKE_POOL_ASSET_POLICY!;
    const STAKE_POOL_ASSET_NAME = process.env.STAKE_POOL_ASSET_NAME!;

    const queryTokenMetadata = trpc.tokens.getMetadata.useQuery({ unit: `${STAKE_POOL_ASSET_POLICY}${STAKE_POOL_ASSET_NAME}` });
    const cnctDecimals = useMemo(() => {
      return queryTokenMetadata.data?.decimals?.value ?? DEFAULT_CNCT_DECIMALS;
    }, [DEFAULT_CNCT_DECIMALS, queryTokenMetadata.data?.decimals]);
    return { cnctDecimals };
};