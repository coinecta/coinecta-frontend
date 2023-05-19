/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    API_URL: process.env.API_URL,
    FORM_EMAIL: process.env.FORM_EMAIL,
  },
  images: {
    domains: ['ergopad-public.s3.us-west-2.amazonaws.com'],
  },
  swcMinify: true,
};

module.exports = nextConfig;
