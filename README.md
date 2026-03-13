# Tullpu

A collaborative drawing application inspired by Excalidraw, built with Svelte 5 and the HTML Canvas API. Draw shapes freely on an infinite canvas with persistence between sessions.

## Features

- **Drawing tools** — Line and Rectangle shape drawing
- **Selection tool** — Click shapes to select them with visual node indicators
- **Infinite canvas** — Pan the canvas with mouse wheel scroll
- **Persistence** — Shapes are saved to `localStorage` and restored on reload
- **HiDPI support** — Renders sharply on high-density displays

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [Svelte 5](https://svelte.dev) + [SvelteKit 2](https://kit.svelte.dev) |
| Language | TypeScript 5 (strict mode) |
| Styling | Tailwind CSS 3 |
| Build | Vite 5 |
| Runtime | Node.js >= 20 |

## Getting Started

```bash
# Install dependencies
npm install

# Start the dev server
npm run dev

# Open in browser
npm run dev -- --open
```

### Other commands

```bash
npm run build      # Production build
npm run preview    # Preview production build
npm run check      # TypeScript + Svelte type checking
npm run lint       # Prettier + ESLint checks
npm run format     # Auto-format with Prettier
```

## Architecture

Tullpu follows Clean Architecture principles with a clear separation between UI, application, and domain layers.

```
src/
├── routes/                  # SvelteKit pages & layout
├── lib/
│   ├── components/          # UI layer (Svelte components)
│   │   ├── Canvas.svelte
│   │   ├── ToolBar.svelte
│   │   └── ToolBarOption.svelte
│   ├── classes/             # Application layer (business logic)
│   │   ├── Canvas.ts          # Event orchestrator & action state machine
│   │   ├── CanvasStore.ts     # State container (wraps Svelte stores)
│   │   ├── CanvasDrawer.ts    # Canvas rendering operations
│   │   ├── ShapeEntity.ts     # Strategy dispatcher for shapes
│   │   └── shapes/
│   │       ├── LineEntity.ts
│   │       └── RectangleEntity.ts
│   ├── stores/              # Reactive state (Svelte stores)
│   │   ├── ToolStore.ts
│   │   ├── ShapeStore.ts
│   │   └── CoordsStore.ts
│   ├── icons/               # SVG icon components
│   └── types.ts             # Domain types & enums
```

### Layers

**UI (components/)** — Pure presentational Svelte components. Mount and display, no business logic.

**Application (classes/)** — All drawing logic lives here. `Canvas.ts` runs the action state machine (`IDLE → DRAW/EDIT → IDLE`). `CanvasDrawer.ts` handles rendering. `ShapeEntity.ts` dispatches to the correct shape implementation via the Strategy pattern.

**Domain (types.ts)** — Immutable type definitions: `Shape`, `Line`, `Rectangle`, `Node`, `Coords`, `ActionType`, `ToolType`.

**State (stores/)** — Svelte writable stores for cross-component reactivity, bridged into `CanvasStore` for class-based code.

### Dual canvas

The app uses two stacked `<canvas>` elements:

- **Static canvas** — Finalized shapes, redrawn only on pan/resize
- **Interactive canvas** — Live preview during drawing, selection overlays

### Data flow

```
MouseEvent → Canvas.ts (state machine)
           → CanvasDrawer.ts (render)
           → ShapeEntity.ts (strategy dispatch)
           → LineEntity / RectangleEntity (shape logic)
           → CanvasRenderingContext2D
```

## Project Status

This is an early MVP. See [DEV_PLAN.md](./DEV_PLAN.md) for the full roadmap and planned refactors.

| Feature | Status |
|---------|--------|
| Draw lines | ✅ |
| Draw rectangles | ✅ |
| Canvas pan | ✅ |
| Shape persistence | ✅ |
| Select line | ✅ |
| Select rectangle | ⚠️ not implemented |
| Edit / drag nodes | ⚠️ infrastructure only |
| Delete shapes | ❌ |
| Undo / Redo | ❌ |
| Copy / Paste | ❌ |
| Shape styling | ❌ |
| Keyboard shortcuts | ❌ |
