// Detect if running in a browser (no cordova) or native
if (window.cordova) {
  document.addEventListener("deviceready", onDeviceReady, false);
} else {
  // Fallback for browser testing
  console.log("[JustAgram] Running in browser mode (No Cordova)");
  // Small delay to ensure DOM is ready
  setTimeout(onDeviceReady, 500);
}

let addMenuJS = "";

// CSS rule file names (must match data-key attributes in menu.html)
const CSS_RULES = [
  "hideReels",
  "hideStories",
  "hideExplore",
  "hideFeed",
  "hideSuggestedReels",
  "hideThreads",
];

async function loadAssets() {
  try {
    console.log("[JustAgram] Loading assets...");

    // Load HTML and JS assets
    const [menuBtnRes, menuRes, scriptRes] = await Promise.all([
      fetch("html/menuButton.html"),
      fetch("html/menu.html"),
      fetch("js/injected/addmenu.js"),
    ]);

    if (!menuBtnRes.ok || !menuRes.ok || !scriptRes.ok) {
      throw new Error("Failed to load one or more assets");
    }

    const menuButtonHTML = await menuBtnRes.text();
    const menuHTML = await menuRes.text();
    addMenuJS = await scriptRes.text();

    // Load CSS rule files in parallel
    const cssResponses = await Promise.all(
      CSS_RULES.map((name) => fetch(`css/rules/${name}.css`))
    );

    // Build cssRules object
    const cssRules = {};
    for (let i = 0; i < CSS_RULES.length; i++) {
      if (cssResponses[i].ok) {
        cssRules[CSS_RULES[i]] = await cssResponses[i].text();
      } else {
        console.warn(`[JustAgram] Failed to load ${CSS_RULES[i]}.css`);
        cssRules[CSS_RULES[i]] = "";
      }
    }

    // Replace placeholders with JSON.stringify'd content
    addMenuJS = addMenuJS.replace("__MENU_BUTTON_HTML__", JSON.stringify(menuButtonHTML));
    addMenuJS = addMenuJS.replace("__MENU_HTML__", JSON.stringify(menuHTML));
    addMenuJS = addMenuJS.replace("__CSS_RULES__", JSON.stringify(cssRules));

    console.log("[JustAgram] Assets loaded successfully");
  } catch (e) {
    console.error("[JustAgram] Failed to load assets", e);
    alert("Failed to load JustAgram assets. The app may not function correctly.");
  }
}

async function onDeviceReady() {
  console.log("Device ready - Launching JustAgram");

  // Load assets before opening browser
  await loadAssets();

  const instagramUrl = "https://www.instagram.com";
  // Added fullscreen=no to show status bar (InAppBrowser defaults to fullscreen=yes)
  const browserOptions =
    "location=no,zoom=no,toolbar=no,footer=no,hardwareback=yes,fullscreen=no";

  // Open Instagram in InAppBrowser
  if (window.cordova && cordova.InAppBrowser) {
    const browser = cordova.InAppBrowser.open(
      instagramUrl,
      "_blank",
      browserOptions
    );

    // Listen for page load completion (Initial load only)
    function onFirstLoad(event) {
      browser.removeEventListener("loadstop", onFirstLoad);

      const url = event.url;
      console.log("[JustAgram] Page loaded (loadstop):", url);

      // Inject menu script (handles CSS dynamically based on user preferences)
      if (addMenuJS) {
        browser.insertScript(
          {
            code: addMenuJS,
          },
          function() {
            console.log("[JustAgram] Menu script injected successfully");
          }
        );
      } else {
        console.error("[JustAgram] No menu script to inject!");
      }
    }
    browser.addEventListener("loadstop", onFirstLoad);

    // Handle errors
    browser.addEventListener("loaderror", function(event) {
      console.error("Failed to load Instagram:", event);
      // alert('Failed to load Instagram. Please check your internet connection.');
    });

    // Handle browser close
    browser.addEventListener("exit", function() {
      console.log("Browser closed - Exiting app");
      navigator.app.exitApp();
    });
  } else {
    console.warn(
      "[JustAgram] InAppBrowser not available. Opening in new tab (CSS Injection will NOT work)."
    );
    window.open(instagramUrl, "_blank");
  }
}
