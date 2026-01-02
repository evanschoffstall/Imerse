/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "https",
        hostname: "localhost",
      },
    ],
  },
  serverExternalPackages: ["@prisma/client", "@prisma/adapter-pg", "pg"],
  turbopack: {},
  webpack: (config, { isServer }) => {
    // Exclude server-only modules from client bundle
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        net: false,
        tls: false,
        fs: false,
        "pg-native": false,
      };
      // Ignore pg and prisma packages in client bundle
      config.externals = config.externals || [];
      config.externals.push({
        pg: "commonjs pg",
        "@prisma/client": "commonjs @prisma/client",
        "@prisma/adapter-pg": "commonjs @prisma/adapter-pg",
      });
    }
    return config;
  },
};

module.exports = nextConfig;
