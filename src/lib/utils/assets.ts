export const toTokenId = (policyId: string, assetName: string): string => {
  const hexAssetName = Buffer.from(assetName, 'utf-8').toString('hex');

  return policyId + hexAssetName;
};