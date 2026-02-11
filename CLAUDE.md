# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Chen-the-Dawnstreak (赤刃明霄陈) is a React 19+ library that provides typed React wrappers for all 46 MDUI (Material Design UI) web components, plus a router wrapper and data-fetching hooks. Published as `chen-the-dawnstreak` on npm.

## Build & Development

- **TypeScript compile**: `npx tsc` (compiles `src/` → `dist/` with declarations)
- **No test framework** is configured yet (`npm test` is a stub)
- **No bundler/linter** is configured — the project outputs ES modules via `tsc`
- Target: ES2020, Module: ESNext, JSX: react-jsx (automatic runtime), strict mode enabled

## Architecture

### Component Factory (`src/components/create-component.tsx`)

The central pattern. `createComponent<P>(tagName, eventMap?)` produces a `forwardRef` React component that:

1. Renders the MDUI custom element via `createElement(tagName, ...)`
2. Separates event handler props from attribute props using the `eventMap`
3. Attaches/detaches DOM event listeners via `useEffect` on an internal ref
4. Translates `className` → `class` for the underlying web component
5. Merges forwarded refs with the internal ref using a `mergeRefs` utility

All 46 components follow this exact pattern. Each component is defined in `src/components/index.ts` as:
- A `Props` interface with typed MDUI attributes + event handlers
- A `createComponent<Props>('mdui-tag-name', { onReactEvent: 'dom-event' })` call
- A side-effect import (`import 'mdui/components/xxx.js'`) to register the custom element

**Key detail**: Event handlers (e.g., `onFocus`, `onChange`) are NOT passed as props to the DOM element. They are intercepted and attached via `addEventListener` on the ref. This is because React's synthetic event system doesn't work with web component custom events.

### Router (`src/router/index.ts`)

A thin re-export layer over `react-router` v7. `ChenRouter` is simply `BrowserRouter` renamed, with the side effect of importing `mdui/mdui.css`. All standard react-router exports (Route, Routes, Link, NavLink, useNavigate, useParams, etc.) are re-exported.

### Data Hooks (`src/hooks/`)

- **`useFetch<T>(url, options?)`**: GET hook with AbortController cleanup, `enabled` flag for conditional fetching, and `refetch` via a counter key. Returns `{ data, loading, error, refetch }`.
- **`useMutation<TData, TVariables>(url, options?)`**: POST hook (method configurable). Auto-serializes body as JSON. Returns `{ mutate, data, loading, error, reset }`.

### Barrel Export (`src/index.ts`)

Single entry point re-exports everything from `./components`, `./router`, and `./hooks`.

## Adding a New Component

1. Add the side-effect import for the MDUI custom element registration
2. Define a `Props` interface with the component's attributes and event handlers (typed as `EventHandler = (event: Event) => void`)
3. Call `createComponent<Props>('mdui-tag-name', eventMap)` where `eventMap` maps React-style prop names to DOM event names
4. All definitions go in `src/components/index.ts` following the numbered section pattern

## MDUI MCP Server

This workspace has an MDUI MCP server configured (see `.claude/settings.local.json`) that provides access to MDUI component metadata, documentation, CSS classes, CSS variables, and icon codes. Use these tools when you need to look up MDUI component APIs or available properties.
