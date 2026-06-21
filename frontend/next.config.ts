import type { NextConfig } from "next";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000").replace(/\/api$/, "");
const WS_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4000";

const nextConfig: NextConfig = {
  output: 'standalone',
  poweredByHeader: false,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'via.placeholder.com' },
    ],
  },
  async rewrites() {
    return [
      { source: "/auth/:path*", destination: `${API_URL}/api/auth/:path*` },
      { source: "/resources/:path*", destination: `${API_URL}/api/resources/:path*` },
      { source: "/users/:path*", destination: `${API_URL}/api/users/:path*` },
      { source: "/universities", destination: `${API_URL}/api/universities` },
      { source: "/courses", destination: `${API_URL}/api/courses` },
      { source: "/resource-types", destination: `${API_URL}/api/resource-types` },
      { source: "/messages/:path*", destination: `${API_URL}/api/messages/:path*` },
      { source: "/reports/:path*", destination: `${API_URL}/api/reports/:path*` },
      { source: "/uploads/:path*", destination: `${API_URL}/api/uploads/:path*` },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          { key: "Content-Security-Policy", value: `default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live; style-src 'self' 'unsafe-inline'; img-src 'self' https://res.cloudinary.com data: blob:; font-src 'self' data:; connect-src 'self' ${API_URL} ${API_URL.replace(/^http/, "ws")} ${WS_URL} ${WS_URL.replace(/^http/, "ws")}; frame-src https://vercel.live; object-src 'none'; base-uri 'self'; form-action 'self'` },
        ],
      },
    ];
  },
};

export default nextConfig;
