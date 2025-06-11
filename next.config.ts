import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  rewrites: async () => {
    return [
      {
        source: "/((?!api|_next/static|_next/image|favicon.ico|robots.txt).*)",
        destination: "/shell",
      },
    ];
  },
  experimental: {
    reactCompiler: true,
  },
};

export default nextConfig;
