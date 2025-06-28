import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Remove basePath and assetPrefix for subdomain deployment
  basePath: '',
  assetPrefix: '',
  images: {
    unoptimized: true
  },
  output: 'export',
  trailingSlash: true,
  webpack: (config, { isServer }) => {
    // Ignore canvas module which is only needed for Node.js
    config.externals = [...(config.externals || []), { canvas: 'canvas' }];
    
    // Handle face-api.js browser compatibility
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
        encoding: false,
      };
    }
    
    return config;
  },
};

export default nextConfig;
