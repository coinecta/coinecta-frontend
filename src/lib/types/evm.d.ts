export { };

declare global {
  type NetworkType = 'Ethereum' | 'Base';

  type TokenSymbol = 'ETH' | 'USDC' | 'USDT';

  interface Token {
    symbol: string;
    address: string | null;
    decimals: number;
  }

  type TokensType = {
    [K in NetworkType]: {
      [T in TokenSymbol]: Token;
    };
  };
}