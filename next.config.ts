import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    serverComponentsExternalPackages: ["@ai-sdk/openai", "ai", "mammoth"],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Prevent Node.js modules from being bundled in the browser
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        path: false,
        os: false,
        stream: false,
        util: false,
        buffer: false,
        process: false,
      }

      // Ignore Node.js specific modules
      config.externals = config.externals || []
      config.externals.push({
        "@nodelib/fs.scandir": "commonjs @nodelib/fs.scandir",
        "@nodelib/fs.stat": "commonjs @nodelib/fs.stat",
        "@nodelib/fs.walk": "commonjs @nodelib/fs.walk",
      })
    }
    return config
  },
}

export default nextConfig
