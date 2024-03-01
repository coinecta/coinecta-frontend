export const toTokenId = (policyId: string, assetName: string): string => {
  const hexAssetName = Buffer.from(assetName, 'utf-8').toString('hex');

  return policyId + hexAssetName;
};

export const formatTokenWithDecimals = (amount: bigint, decimals: number): string => {
  let amountStr = amount.toString();
  if (amountStr.length <= decimals) {
    amountStr = '0'.repeat(decimals - amountStr.length + 1) + amountStr;
  }
  const indexToInsertDecimal = amountStr.length - decimals;
  const formattedAmountStr = amountStr.substring(0, indexToInsertDecimal) + '.' + amountStr.substring(indexToInsertDecimal);
  const resultStr = formattedAmountStr.replace(/^0+/, '');
  return resultStr;
}