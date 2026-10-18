import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Workspace-linked deps (`@variablelab/env`) need to be transpiled by Next.
  transpilePackages: ["@variablelab/env"],
  // Keep `next dev` from writing an AGENTS.md when it detects a coding agent.
  agentRules: false,
};

export default nextConfig;
