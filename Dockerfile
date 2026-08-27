# syntax=docker/dockerfile:1
ARG NODE_VERSION=22-bookworm-slim

# deps and build are pinned to $BUILDPLATFORM so the expensive part — npm ci
# and next build, the latter driven by the native SWC compiler — runs at full
# speed on the runner's own architecture rather than under emulation.
#
# This is only safe because the standalone output is architecture-independent:
# outputFileTracing keeps @next/swc-* out of it (SWC is a build-time compiler),
# and the traced tree contains no .node binaries at all. Verify that assumption
# still holds if a dependency with a native addon is ever added:
#   docker run --rm --entrypoint sh <image> -c 'find . -name "*.node"'
#
# ---- deps ------------------------------------------------------------------
FROM --platform=$BUILDPLATFORM node:${NODE_VERSION} AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci

# ---- build -----------------------------------------------------------------
# Extends deps rather than installing with --omit=dev: `next build` type-checks
# and lints as part of the build, so typescript, @types/* and eslint-config-next
# all have to be present.
FROM --platform=$BUILDPLATFORM deps AS build
WORKDIR /app

# NEXT_PUBLIC_* is substituted into the browser bundle here, at build time — it
# cannot be changed later by a container env var. `/api` keeps the image valid
# in any environment: the ingress routes /api to the API on the same origin, so
# the browser never makes a cross-origin request and CORS never comes up.
ARG NEXT_PUBLIC_BACKENDURL=/api
ENV NEXT_PUBLIC_BACKENDURL=$NEXT_PUBLIC_BACKENDURL
ENV NEXT_TELEMETRY_DISABLED=1

COPY tsconfig.json next.config.ts eslint.config.mjs ./
COPY src ./src
RUN npm run build

# ---- runner ----------------------------------------------------------------
FROM node:${NODE_VERSION} AS runner
# Unlike the API, this one needs an init. Next's standalone server does not
# reliably install a SIGTERM listener, so as PID 1 it ignores the signal and
# sits until the grace period expires — 30 wasted seconds on every pod of every
# rollout. dumb-init forwards it and the process exits immediately.
RUN apt-get update \
 && apt-get install -y --no-install-recommends dumb-init \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
# Required. `next start` binds every interface, but the standalone server.js
# reads HOSTNAME and defaults to localhost — leave this out and nothing outside
# the container can reach it, which reads as a broken app rather than a
# misconfigured one.
ENV HOSTNAME=0.0.0.0
ENV NEXT_TELEMETRY_DISABLED=1

# `output: 'standalone'` traces the runtime into these two directories, so
# there is no third npm install. There is no public/ directory in this repo;
# add a COPY for it if one ever appears, because standalone does not include it.
COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static

USER node
EXPOSE 3000

# `/` is a 307 redirect to /submit, which is exactly what a probe wants: no
# data access, and Kubernetes counts 200-399 as success.
HEALTHCHECK --interval=10s --timeout=3s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/',{redirect:'manual'}).then(r=>process.exit(r.status<400?0:1)).catch(()=>process.exit(1))"

ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["node", "server.js"]
