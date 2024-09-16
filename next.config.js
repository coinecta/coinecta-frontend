/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    API_URL: process.env.API_URL,
    FORM_EMAIL: process.env.FORM_EMAIL,
    STAKING_KEY_POLICY: process.env.STAKING_KEY_POLICY,
    STAKE_POOL_VALIDATOR_ADDRESS: process.env.STAKE_POOL_VALIDATOR_ADDRESS,
    STAKE_POOL_OWNER_KEY_HASH: process.env.STAKE_POOL_OWNER_KEY_HASH,
    STAKE_POOL_ASSET_POLICY: process.env.STAKE_POOL_ASSET_POLICY,
    STAKE_POOL_ASSET_NAME: process.env.STAKE_POOL_ASSET_NAME,
    DEFAULT_CNCT_DECIMALS: process.env.DEFAULT_CNCT_DECIMALS,
    CARDANO_TX_EXPLORER_URL: process.env.CARDANO_TX_EXPLORER_URL,
    COINECTA_SYNC_API: process.env.COINECTA_SYNC_API,
    DEXHUNTER_PARTNER_CODE: process.env.DEXHUNTER_PARTNER_CODE,
    IPGEOLOCATION_API_KEY: process.env.IPGEOLOCATION_API_KEY,
    CARDANO_ASSET_EXPLORER_URL: process.env.CARDANO_ASSET_EXPLORER_URL,
    CARDANO_ADDRESS_EXPLORER_URL: process.env.CARDANO_ADDRESS_EXPLORER_URL,
    WALLETCONNECT_PUBLIC_PROJECT_ID: process.env.WALLETCONNECT_PUBLIC_PROJECT_ID,
    BASE_API_KEY: process.env.BASE_API_KEY
  },
  swcMinify: true,
  webpack: (config, { isServer, webpack }) => {
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      layers: true,
    };

    config.output.webassemblyModuleFilename = 'static/wasm/[modulehash].wasm'

    config.plugins.push(new webpack.ProvidePlugin({
      TextDecoder: ['text-encoding', 'TextDecoder'],
      TextEncoder: ['text-encoding', 'TextEncoder']
    }))


    config.ignoreWarnings = [
      /Critical dependency: the request of a dependency is an expression/,
    ];
    return config;
  },
};

module.exports = nextConfig;
