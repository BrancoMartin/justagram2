(function() {
  window.JustagramDOMHandlers = window.JustagramDOMHandlers || {};

  window.JustagramDOMHandlers['/'] = function handleHome() {
    console.log("[JustAgram] Handling DOM for Home page");

    const data = window.__JUSTAGRAM_DATA__;
    const settings = data?.settings;
    const blockMap = data?.blockMap;

    if (settings && settings.hideFeed === false) {
      console.log("[JustAgram] Home feed hiding is disabled. Skipping DOM removal.");
      return;
    }

    if (blockMap && blockMap['/'] && window.JustagramBlocker) {
      blockMap['/'].forEach((substring) => {
        window.JustagramBlocker.add(substring);
      });
      console.log(`[JustAgram] Applied blocks for Home:`, blockMap['/']);
    }

    try {
      const main = document.querySelector("main");

      if (main) {
        // delete main node
        main.remove();
        console.log("[JustAgram] Cleared all content inside <main>");
      } else {
        console.warn("[JustAgram] No <main> element found waiting for it to load...");
        // If main is not found, we can set up a MutationObserver to wait for it
        const observer = new MutationObserver((mutations, obs) => {
          const main = document.querySelector("main");
          if (main) {
            main.remove();
            console.log("[JustAgram] Cleared all content inside <main> (after waiting)");
            obs.disconnect();
          }
        });
        observer.observe(document.body, { childList: true, subtree: true });
      }

    } catch (e) {
      console.error("[JustAgram] Error handling Home page DOM", e);
    }
  };

  console.log('[JustAgram] Registered handler for /');
})();
