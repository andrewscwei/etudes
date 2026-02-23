# Études [![npm](https://img.shields.io/npm/v/etudes.svg)](https://www.npmjs.com/package/etudes) [![CD](https://github.com/andrewscwei/etudes/workflows/CD/badge.svg)](https://github.com/andrewscwei/etudes/actions?query=workflow%3ACD)

A study of headless React components.

## Usage

```bash
# Development (watch build + demo server on port 8080)
npm run dev

# Build the library
npm run build

# Run tests
npm run unit

# Run tests with coverage
npm run unit -- --coverage

# Type-check without emitting
npm run typecheck

# Lint
npm run lint
npm run lint:fix
```

## Components

- **`primitives/`** — Base UI building blocks, headless/unstyled by design
- **`components/`** — Higher-level components built on top of primitives
- **`hooks/`** — Standalone React hooks covering drag/gestures, observers, media, storage, and general utilities
- **`flows/`** — Control-flow JSX components
- **`hocs/`** — Higher-order components
- **`utils/`** — Pure utility functions for style manipulation, data transformation, key generation, device detection, and React helpers
- **`types/`** — Shared type definitions used across the library
