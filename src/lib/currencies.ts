export const BLOCKCHAINS: AcceptedBlockchain[] = [
  {
    name: "Cardano",
    symbol: "ADA",
    imageUrl: "/images/blockchains/cardano.png",
    tokens: [
      {
        symbol: 'ADA',
        name: 'Cardano',
        contractAddress: null,
        decimals: 6,
        imageUrl: '/images/tokens/cardano.png'
      },
      {
        symbol: 'USDM',
        name: 'Mehen USDM',
        contractAddress: 'c48cbb3d5e57ed56e276bc45f99ab39abe94e6cd7ac39fb402da47ad',
        hexName: '0014df105553444d',
        decimals: 6,
        imageUrl: '/images/tokens/usdm.png'
      },
    ]
  },
  {
    name: "Ethereum",
    symbol: "ETH",
    imageUrl: "/images/blockchains/ethereum.png",
    tokens: [
      {
        symbol: 'ETH',
        name: 'Ethereum',
        contractAddress: null,
        decimals: 18,
        imageUrl: '/images/tokens/ethereum.png'
      },
      {
        symbol: 'USDC',
        name: 'USD Coin',
        contractAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        decimals: 6,
        imageUrl: '/images/tokens/usdc.png'
      },
      {
        symbol: 'USDT',
        name: 'Tether',
        contractAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
        decimals: 6,
        imageUrl: '/images/tokens/usdt.png'
      }
    ]
  },
  {
    name: "Base",
    symbol: "BASE",
    imageUrl: "/images/blockchains/base.png",
    tokens: [
      {
        symbol: 'ETH',
        name: 'Ethereum',
        contractAddress: null,
        decimals: 18,
        imageUrl: '/images/tokens/eth.png'
      },
      {
        symbol: 'USDC',
        name: 'USD Coin',
        contractAddress: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
        decimals: 6,
        imageUrl: '/images/tokens/usdc.png'
      },
      {
        symbol: 'USDT',
        name: 'Tether',
        contractAddress: '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb',
        decimals: 6,
        imageUrl: '/images/tokens/usdt.png'
      }
    ]
  }
];

// Helper function to get all supported tokens across all blockchains
export const getAllSupportedTokens = (): (AcceptedToken & { parentBlockchainSymbol: string, parentBlockchainName: string })[] => {
  return BLOCKCHAINS.flatMap(blockchain =>
    blockchain.tokens.map(token => ({
      ...token,
      parentBlockchainSymbol: blockchain.symbol,
      parentBlockchainName: blockchain.name
    }))
  );
};

// Helper function to get a specific token by blockchain and symbol
export const getToken = (blockchainSymbol: string, tokenSymbol: string): { token: AcceptedToken, parentBlockchainSymbol: string, parentBlockchainName: string } | undefined => {
  const blockchain = BLOCKCHAINS.find(b => b.symbol === blockchainSymbol);
  const token = blockchain?.tokens.find(t => t.symbol === tokenSymbol);
  return blockchain && token
    ? { token, parentBlockchainSymbol: blockchain.symbol, parentBlockchainName: blockchain.name }
    : undefined;
};

// Helper function to get a blockchain by symbol
export const getTokensForBlockchainBySymbol = (blockchainSymbol: string): { tokens: AcceptedToken[], blockchainSymbol: string, blockchainName: string } | undefined => {
  const blockchain = BLOCKCHAINS.find(b => b.symbol === blockchainSymbol);
  return blockchain
    ? { tokens: blockchain.tokens, blockchainSymbol: blockchain.symbol, blockchainName: blockchain.name }
    : undefined;
};

// Helper function to get tokens for a blockchain by name
export const getTokensForBlockchainByName = (blockchainName: string): { tokens: AcceptedToken[], blockchainSymbol: string, blockchainName: string } | undefined => {
  const blockchain = BLOCKCHAINS.find(b => b.name.toLowerCase() === blockchainName.toLowerCase());
  return blockchain
    ? { tokens: blockchain.tokens, blockchainSymbol: blockchain.symbol, blockchainName: blockchain.name }
    : undefined;
};