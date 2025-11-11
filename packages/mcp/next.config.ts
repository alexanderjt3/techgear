import type { NextConfig } from "next";

/**
 * Get the asset prefix for Next.js
 * - Development: Uses localhost with the port from env or default 3000
 * This ensures widget scripts load correctly when embedded in ChatGPT iframes
 */
function getAssetPrefix(): string {
    if (process.env.NODE_ENV === "development") {
        const port = process.env.PORT || 3000;
        return `http://localhost:${port}`;
    }
    return "";  // Use relative paths in production
}

const nextConfig: NextConfig = {
    assetPrefix: getAssetPrefix(),
    output: "standalone",
    transpilePackages: ["headphones-widget"],
};

export default nextConfig;

