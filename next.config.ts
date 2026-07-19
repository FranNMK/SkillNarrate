import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  /*
   * outputFileTracingRoot — tells Next.js which directory is the project root
   * when building. Without this, Next.js may detect multiple lockfiles and
   * print a noisy workspace warning on every build.
   */
  outputFileTracingRoot: path.join(__dirname),

  /*
   * As the project grows we'll add:
   *  - images.remotePatterns  (if we use Supabase Storage for avatars/project images)
   */
};

export default nextConfig;
