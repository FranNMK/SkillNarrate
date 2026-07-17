/*
 * src/types/global.d.ts
 *
 * Global TypeScript declarations.
 *
 * TypeScript doesn't natively understand CSS file imports — it only
 * knows about .ts and .tsx files. Next.js handles CSS at build time,
 * but we need to tell tsc to not error when it sees `import './globals.css'`.
 *
 * This module declaration says: "any file ending in .css is a valid module
 * with no typed exports" — which is exactly right for side-effect CSS imports.
 */

declare module "*.css" {
  const content: Record<string, string>;
  export default content;
}
