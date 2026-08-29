import type { NextConfig } from "next";

import { getPublicEnv } from "./src/lib/env";

getPublicEnv();

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
