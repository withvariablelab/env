import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Workspace-linked deps (`@variablelab/env`) need to be transpiled by Next.
  transpilePackages: ["@variablelab/env"],
};

export default nextConfig;
