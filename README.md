# Polymarket TypeScript SDK

This repository is the home for Polymarket's official TypeScript SDK packages.

## Repository Structure

This repository is organized as a pnpm workspace with SDK packages and examples.

| Package                                    | Description                                                    |
| ------------------------------------------ | -------------------------------------------------------------- |
| [`packages/client`](./packages/client)     | Official TypeScript client for building on Polymarket          |
| [`packages/types`](./packages/types)       | Shared TypeScript types for SDK packages                       |
| [`packages/bindings`](./packages/bindings) | Internal generated API bindings; not intended for direct usage |
| [`examples/scripts`](./examples/scripts)   | Runnable TypeScript scripts for common SDK workflows           |

For installation and usage, see [`packages/client`](./packages/client).

## API Compatibility

The SDK follows semantic versioning. Although minor releases on the 0.x line
may include breaking changes, we aim to avoid them and, whenever possible,
provide a deprecation path before removing or changing an API. Patch releases
remain backward compatible except for APIs marked `@experimental`, which may
change in any release. The Perps APIs are currently experimental.


## Community Tools

Open-source tools built on Polymarket public APIs that complement the SDK.

### 🐋 PolyWatch — Whale Tracker & Analytics Dashboard

> **[osr21/Polywatch](https://github.com/osr21/Polywatch)** · MIT · TypeScript / React 19 / Node.js 24

A self-hostable analytics dashboard that wraps Polymarket public APIs in a real-time UI. Useful as a reference implementation showing how to integrate the REST APIs, CLOB WebSocket feed, Gamma API, and the Perps API in a production TypeScript codebase.

**Endpoints agents and bots can query:**

| Endpoint | Returns |
|---|---|
| `GET /whales` | Live large-trade feed with USDC size filtering |
| `GET /wallets/:address` | Wallet profiles with 0–100 insider risk scores |
| `GET /markets/momentum` | Momentum-ranked market discovery |
| `GET /ai/crypto-signals` | AI-generated bullish/bearish signals per market |
| `GET /perps/instruments` | Perpetual instruments (mark/index price, funding rate, OI) |
| `GET /perps/trades` | Recent perps trade feed |
| `GET /stream` | SSE real-time whale trade stream |

**Architecture pattern:** single Express 5 API server with an OpenAPI contract as the source of truth, Orval-generated React Query hooks, and no database — all data fetched live from Polymarket APIs. Demonstrates integrating both the prediction-market APIs and the experimental Perps API in a TypeScript monorepo (pnpm workspace, same toolchain as this repo).

## Local Development

### Requirements

- Node.js `>=24`
- pnpm `>=10`

Install dependencies:

```bash
nvm use
corepack install
pnpm install
```

Set up local environment variables:

```bash
cp .env.example .env
```

Then open `.env` and fill in the fields.

Build all workspace packages:

```bash
pnpm build
```

### Development Scripts

The root scripts are:

- `pnpm build` - build all workspace packages that expose a build script
- `pnpm clean` - remove package build output from `packages/*/dist`

## TypeScript Config

- Root `tsconfig.json` and package-level `tsconfig.json` files are for editor tooling and source navigation.
- `tsconfig.build.json` files are the configs used by package build and typecheck commands.
- When changing build behavior, prefer updating `tsconfig.build.json`.

## Contributing

We welcome bug reports, feature requests, and feedback through GitHub Issues.
See [CONTRIBUTING.md](./CONTRIBUTING.md) before proposing code changes.

## Maintainer Notes

### Publishing

Publishing is managed by the Changesets GitHub Action. Packages are published to npm through trusted publishing.

## License

This project is licensed under the [MIT License](./LICENSE).
