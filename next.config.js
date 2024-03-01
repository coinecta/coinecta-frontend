/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    API_URL: process.env.API_URL,
    FORM_EMAIL: process.env.FORM_EMAIL,
    CONTRIBUTION_ADDRESS: process.env.CONTRIBUTION_ADDRESS,
    STAKING_KEY_POLICY: process.env.STAKING_KEY_POLICY,
    STAKE_POOL_VALIDATOR_ADDRESS: process.env.STAKE_POOL_VALIDATOR_ADDRESS,
    STAKE_POOL_OWNER_KEY_HASH: process.env.STAKE_POOL_OWNER_KEY_HASH,
    STAKE_POOL_ASSET_POLICY: process.env.STAKE_POOL_ASSET_POLICY,
    STAKE_POOL_ASSET_NAME: process.env.STAKE_POOL_ASSET_NAME
  },
  swcMinify: true,
  webpack: function (config, options) {
    config.experiments = {
      asyncWebAssembly: true,
      layers: true,
    };
    config.ignoreWarnings = [/Critical dependency: the request of a dependency is an expression/];
    return config;
  },
}

module.exports = nextConfig
