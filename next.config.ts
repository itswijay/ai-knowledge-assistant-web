import type { NextConfig } from "next";

import { getPublicEnv } from "./src/lib/env";

getPublicEnv();

const nextConfig: NextConfig = {
  experimental: {
    useTypeScriptCli: false,
  },
};

export default nextConfig;
