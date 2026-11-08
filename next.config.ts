import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Node-only xlsx writer (streams, zip): load it from node_modules at runtime.
  serverExternalPackages: ["exceljs"],
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
