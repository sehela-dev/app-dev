import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  env: {
    // Main/Production environment
    MAIN_AUTH_API_URL: process.env.NEXT_MAIN_AUTH_API_URL,
    MAIN_API_URL: process.env.NEXT_MAIN_API_URL,
    MAIN_SECRET_KEY: process.env.NEXT_MAIN_SECRET_KEY,
    MAIN_SECRET_AUTH_KEY: process.env.NEXT_MAIN_AUTH_SECRET_KEY,

    // Development environment
    DEV_AUTH_API_URL: process.env.NEXT_DEV_AUTH_API_URL,
    DEV_API_URL: process.env.NEXT_DEV_API_URL,
    DEV_SECRET_KEY: process.env.NEXT_DEV_SECRET_KEY,
    DEV_SECRET_AUTH_KEY: process.env.NEXT_DEV_AUTH_SECRET_KEY,
    ENV: process.env.ENV,
  },
};

export default nextConfig;
