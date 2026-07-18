import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /*
   * We keep the config minimal for Phase 0.
   * As the project grows we'll add:
   *  - images.remotePatterns  (if we use Supabase Storage for avatars/project images)
   *
   * Note: serverExternalPackages replaces the old
   * experimental.serverComponentsExternalPackages from Next.js ≤14.
   */
};

export default nextConfig;
