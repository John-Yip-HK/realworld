/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
        pathname: '**',
      },
    ],
  },
  webpack: (config) => {
    config.externals = [...config.externals, "canvas", "jsdom"];
    
    return config;
  }
}

module.exports = nextConfig
