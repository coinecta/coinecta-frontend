import { metadataApi } from "@server/services/metadataApi";
import { useEffect, useState } from "react";

export const useToken = () => {
    const DEFAULT_CNCT_DECIMALS = parseInt(process.env.DEFAULT_CNCT_DECIMALS!);
    const STAKE_POOL_ASSET_POLICY = process.env.STAKE_POOL_ASSET_POLICY!;
    const STAKE_POOL_ASSET_NAME = process.env.STAKE_POOL_ASSET_NAME!;

    const [cnctDecimals, setCnctDecimals] = useState<number>(DEFAULT_CNCT_DECIMALS);
    useEffect(() => {
        const execute = async () => {
          try {
            const cnctMetadata = await metadataApi.postMetadataQuery(`${STAKE_POOL_ASSET_POLICY}${STAKE_POOL_ASSET_NAME}`);
            setCnctDecimals(cnctMetadata.decimals?.value ?? DEFAULT_CNCT_DECIMALS);
          } catch {
            setCnctDecimals(DEFAULT_CNCT_DECIMALS);
          }
        };
        execute();
      }, [DEFAULT_CNCT_DECIMALS, STAKE_POOL_ASSET_NAME, STAKE_POOL_ASSET_POLICY]);

    return { cnctDecimals };
};