# Source Directory Structure

All source files live in this directory, organized by execution context. The `www/` directory **mirrors** this structure with built/generated files.

## Directory Layout

```
src/
├── types/                     # Shared TypeScript types
│   └── index.ts               # Type definitions used by both contexts
├── app/                       # App code (Capacitor WebView context)
│   ├── index.html             # Splash screen entry point
│   ├── main.ts                # Main app logic, InAppBrowser initialization
│   └── style.css              # Splash screen styles
└── injected/                  # Injected code (Instagram page context)
    ├── addmenu.ts             # Menu script injected into Instagram
    ├── README.md              # Bundling documentation
    ├── html/
    │   ├── menu.html          # Settings menu template
    │   └── menuButton.html    # Menu button template
    └── css/
        └── rules/             # Instagram content filters
            ├── hideReels.css
            ├── hideStories.css
            ├── hideExplore.css
            ├── hideFeed.css
            ├── hideSuggestedReels.css
            └── hideThreads.css
```

## Mirrored Structure

The `www/` directory mirrors `src/` with TypeScript compiled to JavaScript:

```
www/
├── index.html                 # Copied from src/app/index.html
├── app/
│   ├── js/
│   │   ├── main.js            # Built from src/app/main.ts
│   │   └── main.js.map
│   └── css/
│       └── style.css          # Copied from src/app/style.css
└── injected/
    ├── js/
    │   ├── addmenu.js         # Built from src/injected/addmenu.ts
    │   └── addmenu.js.map
    ├── html/                  # Copied from src/injected/html/
    └── css/                   # Copied from src/injected/css/
```

## Design Rationale

**Shared types:**
- **`types/`** - TypeScript type definitions shared between app and injected contexts
- Ensures type safety across execution contexts
- Single source of truth for data structures

**Two execution contexts:**
- **`app/`** - Code running in Capacitor WebView (has access to Cordova/Capacitor APIs)
- **`injected/`** - Code running inside Instagram's page (has access to Instagram's DOM, no Cordova APIs)

**Mirrored structure benefits:**
- Easy to understand source → output mapping
- Consistent organization between source and build
- Assets grouped by execution context

## Build Process

When you run `bun run build`:

1. **TypeScript bundling:**
   - `src/app/main.ts` → `www/app/js/main.js` (with source map)
   - `src/injected/addmenu.ts` → `www/injected/js/addmenu.js` (with source map)

2. **Asset copying:**
   - `src/app/index.html` → `www/index.html`
   - `src/app/style.css` → `www/app/css/style.css`
   - `src/injected/html/` → `www/injected/html/`
   - `src/injected/css/` → `www/injected/css/`

## Editing Workflow

1. Edit source files in `src/app/` or `src/injected/`
2. Run `bun run sync` to build and update native projects
3. Open native IDE: `bun run open:android` or `bun run open:ios`

## Important Notes

- **Never edit `www/` files directly** - they are completely regenerated on every build
- All editable source code and assets belong in `src/`
- HTML and CSS files are copied as-is (no processing)
- TypeScript files are bundled with dependencies and minified
