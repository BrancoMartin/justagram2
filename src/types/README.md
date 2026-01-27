# Shared Types

This directory contains TypeScript type definitions shared across different execution contexts (app and injected).

## Files

- **`index.ts`** - Shared type definitions (Settings, CSSRules, JustagramData)
- **`global.d.ts`** - Global declarations for runtime-injected APIs (Cordova, custom window properties)

## Why Shared Types?

The app has two execution contexts that need to communicate:
- **App context** (Capacitor WebView) - loads resources and injects data
- **Injected context** (Instagram page) - receives data and renders UI

Shared types ensure type safety across this boundary.

## Type Definitions

### `Settings`
User preferences for content filtering. Each property corresponds to a toggle in the settings menu.

```typescript
type Settings = {
  hideReels: boolean;
  hideStories: boolean;
  hideExplore: boolean;
  hideFeed: boolean;
  hideSuggestedReels: boolean;
  hideThreads: boolean;
};
```

### `CSSRules`
CSS rules mapped by filter name. Keys must match `Settings` keys.

```typescript
type CSSRules = Record<keyof Settings, string>;
```

### `JustagramData`
Data structure passed from app to injected context via `window.__JUSTAGRAM_DATA__`.

```typescript
type JustagramData = {
  menuButtonHTML: string;
  menuHTML: string;
  cssRules: CSSRules;
};
```

## Usage

Import types from this module in both contexts:

```typescript
// In src/app/main.ts
import type { Settings, CSSRules, JustagramData } from '../types';

// In src/injected/addmenu.ts
import type { Settings, CSSRules, JustagramData } from '../types';
```

## Global Type Declarations

The `global.d.ts` file declares globals that are injected at runtime:

### Cordova
Cordova is injected by the native wrapper at runtime, not available as an ES module:

```typescript
// Can't do this - Cordova isn't an npm package
import cordova from 'cordova'; // ❌

// Instead, use global declaration
const cordova: typeof window.cordova; // ✅
```

Usage:
```typescript
if (typeof cordova !== 'undefined') {
  const browser = cordova.InAppBrowser.open(url, '_blank', options);
}
```

### Custom Window Properties

```typescript
interface Window {
  __JUSTAGRAM_DATA__?: JustagramData;
}
```

Usage:
```typescript
const data = window.__JUSTAGRAM_DATA__; // Typed as JustagramData | undefined
```

## Benefits

- **Single source of truth** - Type changes propagate automatically
- **Type safety** - Compiler catches mismatches between contexts
- **No `as any` casts** - Proper typing via `@types/cordova` and global augmentations
- **Maintainability** - Easy to see and modify shared data structures
- **Documentation** - Types serve as contract between contexts
