// --- Configuration Maps ---

const blockMap: Record<string, string[]> = {
  "/": ["graphql", "collection"],
  // "/reels/": ["some-other-string"]
};

const domHandlerMap: Record<string, () => void> = {
  "/": handleHome,
  "/explore/": handleExplore,
};

// --- Helper Functions ---

function getPathFromUrl(url?: string | URL | null): string {
  if (!url) return window.location.pathname;
  try {
    return new URL(url.toString(), window.location.origin).pathname;
  } catch {
    return window.location.pathname;
  }
}

function applyBlocksForPath(path: string) {
  if (window.JustagramBlocker) {
    window.JustagramBlocker.clear();

    const substringsToBlock = blockMap[path] || [];
    substringsToBlock.forEach(substring => {
      window.JustagramBlocker!.add(substring);
    });

    if (substringsToBlock.length > 0) {
      console.log(`[JustAgram] Applied blocks for ${path}:`, substringsToBlock);
    }
  }
}

// --- DOM Handlers ---

function handleHome() {
  console.log("[JustAgram] Handling DOM for Home page");

  try {
    const main = document.querySelector("main");

    if (main) {
      main.replaceChildren(); // removes all child nodes
      console.log("[JustAgram] Cleared all content inside <main>");
    } else {
      console.warn("[JustAgram] No <main> element found");
    }

  } catch (e) {
    console.error("[JustAgram] Error handling Home page DOM", e);
  }
}

function handleExplore() {
  console.log("[JustAgram] Handling DOM for Explore page");
}

function handleNavigation(path: string) {
  const handler = domHandlerMap[path];
  if (handler) {
    handler();
  }
}

// --- Core Routing Logic ---

function processRoute(path: string, executeNavigation?: () => void) {
  // 2. If no redirect, proceed normally
  applyBlocksForPath(path);

  // 3. Let the SPA finish its history update (if it triggered one)
  if (executeNavigation) {
    executeNavigation();
  }

  // 4. Update the DOM
  handleNavigation(path);
}

// --- History Patches and Event Listeners ---

const originalPushState = history.pushState;
history.pushState = function(state, unused, url) {
  const targetPath = getPathFromUrl(url);
  processRoute(targetPath, () => {
    originalPushState.apply(this, [state, unused, url]);
  });
};

const originalReplaceState = history.replaceState;
history.replaceState = function(state, unused, url) {
  const targetPath = getPathFromUrl(url);
  processRoute(targetPath, () => {
    originalReplaceState.apply(this, [state, unused, url]);
  });
};

window.addEventListener("popstate", () => {
  processRoute(window.location.pathname);
});

// Initial load check
setTimeout(() => {
  processRoute(window.location.pathname);
}, 50);
