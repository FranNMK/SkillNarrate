import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /*
   * We keep the config minimal for Phase 0.
   * As the project grows we'll add:
   *  - images.domains  (if we use Supabase Storage for avatars/project images)
   *  - experimental.serverActions  (already on by default in Next 15)
   */
  experimental: {
    // Allows us to import server-only packages inside Server Components
    // without them accidentally bundled for the browser.
    serverComponentsExternalPackages: [],
  },
};

export default nextConfig;
