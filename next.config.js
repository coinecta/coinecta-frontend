/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    API_URL: process.env.API_URL,
    FORM_EMAIL: process.env.FORM_EMAIL,
    SUMSUB_TOKEN: process.env.SUMSUB_TOKEN,
    SUMSUB_SECRET_KEY: process.env.SUMSUB_SECRET_KEY
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
