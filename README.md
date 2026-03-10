# DesignFlow Studio

> A browser-based graphic design tool built with React — inspired by Figma and Adobe Illustrator. Create logos, banners, social media graphics, and more. Includes a built-in image enhancer with upscaling up to HD (1080p).

---

## ✦ Preview

```
┌──────────────────────────────────────────────────────────────┐
│  DESIGNFLOW  │ File  Edit  View  Insert        100%  ☀ Light │
├──────────────┬───────────────────────────────┬───────────────┤
│  Layers      │                               │  Style        │
│  Assets      │        [ SVG Canvas ]         │  Arrange      │
│  Enhance     │                               │  Canvas       │
│              │   drag · resize · rotate      │               │
│  layer list  │   shapes · text · images      │  color pickers│
│              │                               │  gradients    │
└──────────────┴───────────────────────────────┴───────────────┘
```

---

## Features

### Design Canvas
- SVG-based canvas with live rendering
- Drag to move, corner handles to resize, rotate handle on every layer
- Zoom from 10% to 400%
- Toggle dot grid overlay
- Dark mode and Light mode with full token-based theming

### Shapes & Elements
- Rectangle, Circle, Ellipse, Triangle, Star, Hexagon, Diamond
- Text layers with full typography controls
- Image layers via file upload or paste (`Ctrl/Cmd + V`)

### Layer Management
- Infinite layers with z-order control (bring forward / send back)
- Per-layer visibility toggle and lock toggle
- Duplicate, delete, and rename layers
- Layer panel with type icons and color indicators

### Typography
- 14 curated display and body fonts (Google Fonts)
- Font size, letter spacing, bold, italic
- Inline text editing

### Color & Gradients
- Fill and stroke color pickers per layer
- Stroke width control
- 12 one-click gradient presets
- Custom gradient via hex or color picker
- Corner radius on rectangles

### Image Enhancer
- Upload any image to enhance
- Sharpness (unsharp mask convolution kernel)
- Brightness, Contrast, Saturation sliders
- Upscale: 1×, 2×, or 4× (up to 1080p HD)
- Side-by-side before/after preview
- Download enhanced image as PNG

### Export
- Export as SVG (scalable vector)
- Export as PNG at 3× resolution
- Export as HD PNG (scales to 1080p)

### Templates
- Minimal Mark — clean wordmark with rule
- Circle Bold — monogram inside ring
- Geometric — diamond frame with centered text

### Canvas Presets
| Preset | Size |
|---|---|
| Logo | 400 × 400 |
| Banner | 1200 × 400 |
| Instagram Square | 1080 × 1080 |
| Story | 1080 × 1920 |
| Twitter Header | 1500 × 500 |
| Business Card | 1050 × 600 |

---

## Keyboard Shortcuts

| Key | Action |
|---|---|
| `V` | Select tool |
| `H` | Hand / Pan tool |
| `R` | Add Rectangle |
| `T` | Add Text |
| `Del` / `Backspace` | Delete selected layer |
| `⌘D` / `Ctrl+D` | Duplicate selected layer |
| `⌘Z` / `Ctrl+Z` | Undo |
| `⌘Y` / `Ctrl+Y` | Redo |
| `⌘V` / `Ctrl+V` | Paste image from clipboard |
| `+` / `=` | Zoom in |
| `-` | Zoom out |
| `0` | Reset zoom to 100% |
| `Esc` | Deselect / close menus |

---

## Tech Stack

- **React 18** — functional components with hooks
- **useReducer** — layer state management
- **useRef** — pointer event handling (drag, resize, rotate) with zero stale closures
- **SVG** — all rendering is native SVG inside a React component
- **Canvas API** — used for image enhancement and PNG export
- **Google Fonts** — 14 fonts loaded via `<link>`
- No external UI libraries — 100% custom components

---

## Getting Started

### Run locally

```bash
# Clone the repo
git clone https://github.com/your-username/designflow-studio.git
cd designflow-studio

# Install dependencies
npm install

# Start dev server
npm run dev
```

### Use as a React component

The entire app is a single `.jsx` file with a default export.

```jsx
import DesignFlowStudio from './designflow-studio';

function App() {
  return <DesignFlowStudio />;
}
```

Make sure your bundler loads Google Fonts or add the `<link>` tag to your HTML head:

```html
<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Unbounded:wght@700;900&family=Raleway:wght@400;700&family=Montserrat:wght@400;600&display=swap" rel="stylesheet" />
```

---

## Project Structure

```
designflow-studio.jsx
│
├── DARK / LIGHT         # Theme token objects
├── FONTS                # Font list (14 Google Fonts)
├── GRADIENTS            # 12 preset gradient pairs
├── PRESETS              # Canvas size presets
├── TEMPLATES            # 3 logo templates
│
├── reducer()            # Layer state: SET, ADD, UPDATE, DELETE, DUP, ORDER
│
└── App (default export)
    ├── State            # layers, history, zoom, theme, tool, tabs, canvas
    ├── Refs             # dragRef, resizeRef, rotateRef (stale-closure-free)
    ├── Callbacks        # addLayer, addShape, updateLayer, commitUpdate, applyTemplate
    ├── Effects          # pointermove/up, paste, keydown
    ├── renderLayer()    # SVG layer renderer with selection handles
    ├── Left Panel       # Layers / Assets / Enhance tabs
    ├── Canvas           # SVG workspace with zoom and grid
    └── Right Panel      # Style / Arrange / Canvas property tabs
```

---

## Architecture Notes

### Stale Closure–Free Pointer Events

All drag, resize, and rotate interactions use `useRef` instead of `useState` inside the global `pointermove` / `pointerup` handlers. This avoids the classic React stale closure problem where values captured in `useEffect` go stale between renders.

```js
const dragRef   = useRef(null);   // { id, mx, my, ox, oy }
const resizeRef = useRef(null);   // { id, pos, sx, sy, ow, oh }
const rotateRef = useRef(null);   // { id, ox, oy }
```

### Layer State

Layers are managed with `useReducer` for predictable updates. Undo/redo is a simple history array with an index pointer — up to 40 snapshots.

### Image Enhancement

Sharpness uses a 3×3 unsharp mask convolution kernel applied directly to `ImageData` pixel arrays:

```js
const kernel = [-s, -s, -s, -s, 1+8*s, -s, -s, -s, -s];
```

Upscaling uses `ctx.imageSmoothingQuality = "high"` with canvas scaling.

---

## Roadmap

- [ ] Pen / path tool
- [ ] Text on path
- [ ] Multi-select and group
- [ ] Align & distribute tools
- [ ] Snap to grid / snap to objects
- [ ] Component library (reusable elements)
- [ ] Local storage auto-save
- [ ] Import existing SVG files
- [ ] Export individual layers

---

## License

MIT — free to use, modify, and distribute.

---

*Built with React + SVG. No canvas libraries, no dependencies beyond React itself.*
