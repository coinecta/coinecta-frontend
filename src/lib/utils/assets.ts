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

export const parseTokenFromString = (formattedAmount: string, decimals: number): bigint => {

  let amountStr = formattedAmount.replace('.', '');

  const digitsAfterDecimal = formattedAmount.split('.')[1]?.length || 0;

  if (digitsAfterDecimal < decimals) {
    amountStr += '0'.repeat(decimals - digitsAfterDecimal);
  }

  return BigInt(amountStr);
}

export const formatNumber = (num: number, key: string): string => `${num.toLocaleString(undefined, {
  maximumFractionDigits: 2
})}${key !== '' && key != null ? ` ${key}` : ''}`;
