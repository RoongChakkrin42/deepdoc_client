import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /**
   * Two ways out, because there are two places this runs.
   *
   * `standalone` (the default here) traces the runtime into `.next/standalone`
   * so the container image ships a server and the modules it actually imports
   * rather than the whole `node_modules` tree. The generated `server.js` reads
   * both `PORT` and `HOSTNAME` — and unlike `next start` it defaults `HOSTNAME`
   * to localhost, so a container must set it to 0.0.0.0 or nothing outside the
   * pod can reach it.
   *
   * `NEXT_OUTPUT=export` instead emits plain files into `out/`. Every page here
   * is client-rendered, so there is nothing for a server to do at request time
   * and a static host can serve the lot — which on a free tier means no
   * container to spin down and therefore no cold start in front of a visitor.
   * The API still needs a server; the frontend does not.
   */
  output: (process.env.NEXT_OUTPUT as 'standalone' | 'export') ?? 'standalone',

  /**
   * Static export writes `submit.html`, and a plain file server answers 404 for
   * the `/submit` a user actually types — the extensionless mapping is a
   * host-specific rewrite rule, so relying on it means the site breaks on
   * whichever host does not have one. With trailing slashes Next emits
   * `submit/index.html` instead, which every static host resolves natively as a
   * directory index. Only applied when exporting; the server build keeps its
   * existing URLs.
   */
  trailingSlash: process.env.NEXT_OUTPUT === 'export',

  reactStrictMode: true,

  /** Nothing gains from advertising the framework in a response header. */
  poweredByHeader: false,

  /**
   * `sharp` arrives as an optional transitive dependency of `next` and only
   * ever runs behind `next/image`, which this app does not use. It is also
   * where the tree's outstanding high-severity advisories live, so excluding
   * it removes both dead weight and every finding an image scanner would
   * report.
   *
   * Do not reach for `npm ci --omit=optional` instead: `@next/swc-*` sits in
   * the same `optionalDependencies` block, and `next build` cannot run without
   * its native compiler.
   */
  outputFileTracingExcludes: {
    '*': ['node_modules/sharp/**', 'node_modules/@img/**'],
  },
};

export default nextConfig;
