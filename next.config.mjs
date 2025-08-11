/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'i.ytimg.com' },
      { protocol: 'https', hostname: 'img.youtube.com' },
      { protocol: 'https', hostname: 'cdn.rumble.com' },
      { protocol: 'https', hostname: 'thumbnails.odycdn.com' },
      { protocol: 'https', hostname: 'static-3.bitchute.com' },
    ],
  },
  webpack: (config) => {
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      // Map native "eccrypto" to a browser-safe polyfill
      eccrypto: 'eccrypto-js',
      // prevent native modules from being pulled in
      secp256k1: false,
      fs: false,
      path: false,
      crypto: false,
    };
    config.resolve.fallback = {
      ...(config.resolve.fallback || {}),
      fs: false,
      path: false,
      crypto: false,
    };
    return config;
  },
};

export default nextConfig;
