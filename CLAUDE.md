# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — start Vite dev server with HMR
- `npm run build` — typecheck with `tsc` then bundle with Vite
- `npm run preview` — serve the production build locally

No test runner or linter is configured.

## Build Notes

Vite is configured with `vite-plugin-singlefile` — production builds inline all JS/CSS into a single `dist/index.html`. The build target is ES2020.

## Architecture

Interactive D3.js timeline visualization of Earth's geological history (4.54 Ga to present). TypeScript, no framework — pure D3 + DOM.

**Entry point:** `src/main.ts` creates a `Timeline` instance, which owns the entire app.

**`Timeline` (`src/components/Timeline.ts`)** is the orchestrator:
- Sets up the SVG, D3 zoom/pan behavior, and keyboard shortcuts
- Creates and coordinates all visual component instances
- On zoom/pan events, calls `render(ctx)` on each component with a shared `RenderContext` (xScale, transform, viewport dimensions)

**Component pattern:** Each component in `src/components/` is a class that receives a D3 `<g>` parent, data, and callback functions (for tooltip/click). Components implement `render(ctx: RenderContext)` to update their SVG elements when the zoom changes. Components do not communicate with each other directly — `Timeline` mediates.

**Components:** `GeoLayer` (reused for eon/era/period rows), `Events` (event markers), `SpeciesBars` (species range bars with lane packing), `Extinctions` (vertical extinction bands), `Grid`, `Axis`, `YouAreHere`, `Tooltip`, `InfoPanel`, `NavBar`

**Data** (`src/data/`): Static arrays of geological eons/eras/periods, key events, and dominant species. All dates are in Ma (millions of years ago). Each data item has `name`/`ru` fields for bilingual support plus `wikiUrl`/`wikiRu` for Wikipedia links.

**i18n** (`src/i18n.ts`): Module-level `LANG` variable toggled between `"en"` and `"ru"`. Helper functions `t()`, `N()`, `Desc()`, `Wiki()` select the right string. No external i18n library.

**Utilities** (`src/utils/`): `geology.ts` flattens the nested Eon→Era→Period hierarchy and packs species into non-overlapping lanes. `color.ts` picks contrast text colors. `format.ts` formats dates/durations.

**X-axis scale:** `d3.scalePow().exponent(0.5)` — square-root scale mapping 4540→0 Ma to screen pixels, giving more visual space to recent (compressed) time.
