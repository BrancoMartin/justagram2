# Injected Code Bundling

This directory contains TypeScript code that gets **injected into Instagram's web page** via `cordova-plugin-inappbrowser`'s `insertScript()` method.

## Execution Context

Unlike `main.ts` which runs in the **Capacitor WebView**, code in this directory runs inside **Instagram's DOM** with access to:
- Instagram's page DOM
- Instagram's `localStorage`
- No access to Cordova/Capacitor APIs

## Bundling Strategy

Both `main.ts` and `injected/addmenu.ts` are bundled **separately** to create two isolated bundles:

```bash
# Two separate build outputs
bun build src/main.ts --outdir www/js
bun build src/injected/addmenu.ts --outdir www/js/injected
```

### Why Separate Bundles?

1. **Different execution contexts** - Main runs in Capacitor, injected runs in Instagram
2. **No shared dependencies** - Each bundle is completely self-contained
3. **Different capabilities** - Injected code can't access Cordova APIs, main code can't access Instagram's DOM

## How It Works

1. **Build time:** `addmenu.ts` is bundled with all its npm dependencies
2. **Runtime data loading:** `app/main.ts` loads HTML templates and CSS rules
3. **Data injection:** `app/main.ts` injects data as `window.__JUSTAGRAM_DATA__` global variable
4. **Script injection:** `app/main.ts` injects the bundled `addmenu.js` which reads from the global
5. **Execution:** Script initializes the menu using the provided data

## Data Flow

```typescript
// In app/main.ts (Capacitor context)
const data = {
  menuButtonHTML: '...',
  menuHTML: '...',
  cssRules: { hideReels: '...', ... }
};
browser.insertScript({ code: `window.__JUSTAGRAM_DATA__ = ${JSON.stringify(data)}` });
browser.insertScript({ code: addMenuJS });

// In injected/addmenu.ts (Instagram context)
const data = window.__JUSTAGRAM_DATA__;
const cssRules = data.cssRules;
const menuButtonHTML = data.menuButtonHTML;
// ... use the data
```

## Adding External Libraries

You can import npm packages in `addmenu.ts` and they'll be bundled automatically:

```typescript
import { debounce } from 'lodash-es';

const handleToggle = debounce(() => {
  // Your code
}, 300);
```

The bundled output will include lodash code inline, making it work inside Instagram's CSP-restricted environment.

## Debugging

To debug injected code:
- **Android:** Use `chrome://inspect` while app is running
- **iOS:** Use Safari Developer Tools

The injected bundle includes source maps for easier debugging.
