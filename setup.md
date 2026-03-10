# DesignFlow Studio — Setup Guide

A complete step-by-step guide to get DesignFlow Studio running locally in VSCode.

---

## What You Need to Install

| Tool | Purpose | Required |
|---|---|---|
| Node.js (v18+) | JavaScript runtime | ✅ Yes |
| npm | Package manager (comes with Node) | ✅ Yes |
| VSCode | Code editor | ✅ Yes |
| Git | Clone the repo | ✅ Yes |
| VSCode Extensions (below) | Better dev experience | Recommended |

---

## Step 1 — Install Node.js

1. Go to **https://nodejs.org**
2. Download the **LTS version** (recommended for most users)
3. Run the installer — keep all defaults
4. Verify it installed correctly:

```bash
node --version
# Expected: v18.x.x or higher

npm --version
# Expected: 9.x.x or higher
```

> If you already have Node but it's older than v16, update it. The easiest way is via **nvm** (Node Version Manager).

---

## Step 2 — Install Git

**Windows:**
- Download from https://git-scm.com/download/win
- Run installer, keep all defaults
- Choose "Git from the command line and also from 3rd-party software" when prompted

**Mac:**
```bash
# Option A: Install via Xcode Command Line Tools (easiest)
xcode-select --install

# Option B: Install via Homebrew
brew install git
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update && sudo apt install git
```

Verify:
```bash
git --version
# Expected: git version 2.x.x
```

---

## Step 3 — Install VSCode

1. Go to **https://code.visualstudio.com**
2. Download for your OS and install
3. Open VSCode

---

## Step 4 — Install Recommended VSCode Extensions

Open VSCode → press `Ctrl+Shift+X` (Windows/Linux) or `Cmd+Shift+X` (Mac) to open Extensions.

Search and install these:

| Extension | Publisher | Why |
|---|---|---|
| **ES7+ React/Redux/React-Native snippets** | dsznajder | React shorthand snippets |
| **Prettier - Code formatter** | Prettier | Auto-formats your code |
| **ESLint** | Microsoft | Catches JS/React errors |
| **Auto Rename Tag** | Jun Han | Renames paired JSX tags |
| **Bracket Pair Colorizer** | CoenraadS | Color-codes brackets |
| **GitLens** | GitKraken | Better Git integration |
| **Path Intellisense** | Christian Kohler | Autocompletes file paths |

> These are optional but highly recommended — they make React development significantly easier.

---

## Step 5 — Create a New React App

You have two options depending on your preference.

### Option A — Vite (Recommended — fast, modern)

```bash
# Create a new project
npm create vite@latest designflow-studio -- --template react

# Move into the project folder
cd designflow-studio

# Install dependencies
npm install
```

### Option B — Create React App (classic)

```bash
npx create-react-app designflow-studio
cd designflow-studio
```

---

## Step 6 — Add DesignFlow Studio to Your Project

### If you're cloning from GitHub:

```bash
git clone https://github.com/your-username/designflow-studio.git
cd designflow-studio
npm install
```

### If you're adding the file manually:

1. Copy `designflow-studio.jsx` into the `src/` folder of your project
2. Open `src/App.jsx` (or `src/App.js`) and replace its contents with:

```jsx
import DesignFlowStudio from './designflow-studio';

function App() {
  return <DesignFlowStudio />;
}

export default App;
```

3. Open `src/index.css` (or your global CSS file) and add:

```css
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  overflow: hidden;
}
```

> The `overflow: hidden` on body is important — it prevents scrollbars from appearing on the outer page since the app manages its own layout.

---

## Step 7 — Run the App

```bash
# If using Vite
npm run dev

# If using Create React App
npm start
```

Then open your browser and go to:
```
http://localhost:5173   ← Vite
http://localhost:3000   ← Create React App
```

You should see DesignFlow Studio running. ✅

---

## Step 8 — Open in VSCode

```bash
# From inside your project folder
code .
```

This opens the entire project in VSCode. You'll see the file tree on the left.

---

## Project File Structure (after setup)

```
designflow-studio/
│
├── public/
│   └── index.html           # HTML entry point
│
├── src/
│   ├── App.jsx              # Root component — imports DesignFlowStudio
│   ├── designflow-studio.jsx  # ← THE MAIN APP FILE
│   ├── index.css            # Global styles (reset + overflow hidden)
│   └── main.jsx             # React DOM render entry (Vite)
│
├── package.json             # Project metadata and scripts
├── package-lock.json        # Locked dependency versions
├── vite.config.js           # Vite config (if using Vite)
└── README.md                # Project documentation
```

---

## Dependencies

DesignFlow Studio has **zero npm dependencies beyond React itself.**

Your `package.json` dependencies section should look like this:

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.0.0",
    "vite": "^4.4.0"
  }
}
```

No extra packages to install. Everything (SVG rendering, drag/resize, image enhancement, export) is built with native browser APIs.

---

## Fonts (Google Fonts)

The app loads fonts automatically from Google Fonts via a `<link>` tag embedded in the component. You need an **internet connection** on first load for fonts to appear.

If you want to use fonts offline, download them from https://fonts.google.com and add them to your `public/fonts/` folder, then update the `@font-face` declarations in your CSS.

Fonts used:
```
Bebas Neue        — display headlines
Anton             — bold headlines
Cinzel            — elegant serif display
Unbounded         — geometric modern
Playfair Display  — editorial serif
Raleway           — clean sans
Montserrat        — modern sans
Oswald            — condensed sans
Pacifico          — script / handwriting
Lobster           — retro script
Orbitron          — sci-fi / tech
Fjalla One        — poster bold
Righteous         — rounded display
DM Serif Display  — editorial serif
```

---

## Common Errors & Fixes

### ❌ `npm: command not found`
Node.js is not installed or not in your PATH. Reinstall from https://nodejs.org.

---

### ❌ `Cannot find module 'react'`
Dependencies aren't installed. Run:
```bash
npm install
```

---

### ❌ `SyntaxError: Unexpected token '<'` (in `.jsx` file)
Your bundler isn't set up to handle JSX. Make sure you're using Vite or Create React App, and the file extension is `.jsx` not `.js`.

For Vite, check `vite.config.js` includes the React plugin:
```js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
});
```

---

### ❌ App renders but layout is broken / scrollbars appear
Add `overflow: hidden` to `body` in your global CSS:
```css
body {
  overflow: hidden;
}
```

---

### ❌ Fonts not loading / text looks wrong
Check your internet connection. Google Fonts are loaded via CDN. If you're offline, the browser falls back to `sans-serif`.

---

### ❌ `npm run dev` says port already in use
Another app is using port 5173. Either stop that app or run on a different port:
```bash
npm run dev -- --port 3001
```

---

### ❌ Paste image (Ctrl+V) not working
- Make sure you've copied an actual image (screenshot, right-click → Copy Image)
- Pasting a file path or filename won't work — it must be image data in the clipboard
- On some browsers, clipboard paste requires the page to be focused (click the canvas first)

---

## Scripts Reference

| Command | What it does |
|---|---|
| `npm install` | Install all dependencies |
| `npm run dev` | Start local dev server (Vite) |
| `npm start` | Start local dev server (CRA) |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |

---

## Building for Production

```bash
npm run build
```

This outputs a `dist/` folder (Vite) or `build/` folder (CRA) with optimized static files ready to deploy.

### Deploy to Vercel (easiest)
```bash
npm install -g vercel
vercel
```

### Deploy to Netlify
Drag and drop the `dist/` or `build/` folder to https://app.netlify.com/drop

### Deploy to GitHub Pages
```bash
npm install --save-dev gh-pages
```
Add to `package.json`:
```json
"homepage": "https://your-username.github.io/designflow-studio",
"scripts": {
  "predeploy": "npm run build",
  "deploy": "gh-pages -d dist"
}
```
Then run:
```bash
npm run deploy
```

---

## System Requirements

| | Minimum | Recommended |
|---|---|---|
| OS | Windows 10, macOS 11, Ubuntu 20.04 | Latest version |
| Browser | Chrome 90+, Firefox 88+, Edge 90+ | Chrome latest |
| RAM | 4 GB | 8 GB+ |
| Node.js | v16 | v18 LTS or v20 LTS |
| Disk space | ~200 MB (with node_modules) | — |

> Safari has limited support for some SVG pointer events. Chrome or Firefox recommended.

---

*For issues or questions, open a GitHub Issue on the repo.*
