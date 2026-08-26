import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /**
   * Traces the runtime into `.next/standalone`, so the image ships a server
   * and the modules it actually imports rather than the whole `node_modules`
   * tree. The generated `server.js` reads both `PORT` and `HOSTNAME` — and
   * unlike `next start` it defaults `HOSTNAME` to localhost, so a container
   * must set it to 0.0.0.0 or nothing outside the pod can reach it.
   */
  output: 'standalone',

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
