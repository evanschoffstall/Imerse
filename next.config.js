/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["localhost"],
  },
  experimental: {
    serverComponentsExternalPackages: [
      "@prisma/client",
      "@prisma/adapter-pg",
      "pg",
    ],
  },
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
