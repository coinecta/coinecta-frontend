/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    API_URL: process.env.API_URL,
    FORM_EMAIL: process.env.FORM_EMAIL,
    CONTRIBUTION_ADDRESS: process.env.CONTRIBUTION_ADDRESS,
    XERBERUS_API_KEY: process.env.XERBERUS_API_KEY,
    XERBERUS_EMAIL: process.env.XERBERUS_EMAIL
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
