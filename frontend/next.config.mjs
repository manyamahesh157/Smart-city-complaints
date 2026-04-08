/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    // If a BACKEND_URL is set in Vercel (e.g., https://my-render-backend.com)
    // it will proxy to that. Otherwise, defaults to local dev port 5000.
    const destinationUrl = process.env.BACKEND_URL 
      ? `${process.env.BACKEND_URL}/api/:path*` 
      : 'http://127.0.0.1:5000/api/:path*';

    return [
      {
        source: '/api/:path*',
        destination: destinationUrl,
      },
    ]
  },
};

export default nextConfig;
