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
};

export default nextConfig;
