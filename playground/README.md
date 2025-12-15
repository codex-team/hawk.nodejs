# Hawk Playground

Simple Node.js + TypeScript playground app for testing `@hawk.so/nodejs`.

## Prerequisites

**Important**: The parent package (`@hawk.so/nodejs`) must be built before running the playground tests.

1. Build the parent package first:
```bash
cd ..
yarn install
yarn build
```

## Setup

1. Install dependencies:

```bash
cd playground
yarn install
```

## Running Tests

Run the test script that raises an exception and sends it to Hawk:

```bash
yarn test
```

The test script uses `ts-node` to run TypeScript directly without needing a build step.

## Configuration

You can set a custom Hawk integration token via environment variable:
```bash
HAWK_TOKEN=your_token_here yarn test
```

The default token is from the example configuration.

