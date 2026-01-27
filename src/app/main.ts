/// <reference path="../types/global.d.ts" />

import type { CSSRules, JustagramData, Settings } from '../types';

// Detect if running in a browser (no cordova) or native
if (typeof cordova !== 'undefined') {
  document.addEventListener("deviceready", onDeviceReady, false);
} else {
  // Fallback for browser testing
  console.log("[JustAgram] Running in browser mode (No Cordova)");
  // Small delay to ensure DOM is ready
  setTimeout(onDeviceReady, 500);
}

let addMenuJS = "";

// CSS rule file names (must match data-key attributes in menu.html and Settings keys)
const CSS_RULES: (keyof Settings)[] = [
  "hideReels",
  "hideStories",
  "hideExplore",
  "hideFeed",
  "hideSuggestedReels",
  "hideThreads",
];

// Default settings
const defaultSettings: Settings = {
  hideReels: true,
  hideStories: true,
  hideExplore: true,
  hideFeed: true,
  hideSuggestedReels: true,
  hideThreads: true
};

function loadSettings(): Settings {
  try {
    const saved = localStorage.getItem('justagram_settings');
    if (saved) {
      return { ...defaultSettings, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.error("[JustAgram] Failed to load settings", e);
  }
  return { ...defaultSettings };
}

function saveSettings(settings: Settings): void {
  try {
    localStorage.setItem('justagram_settings', JSON.stringify(settings));
    console.log("[JustAgram] Settings saved to main app storage");
  } catch (e) {
    console.error("[JustAgram] Failed to save settings", e);
  }
}

let justagramData: JustagramData | null = null;

async function loadAssets(): Promise<void> {
  try {
    console.log("[JustAgram] Loading assets...");

    // Load HTML and JS assets
    const [menuBtnRes, menuRes, scriptRes] = await Promise.all([
      fetch("injected/html/menuButton.html"),
      fetch("injected/html/menu.html"),
      fetch("injected/js/addmenu.js"),
    ]);

    if (!menuBtnRes.ok || !menuRes.ok || !scriptRes.ok) {
      throw new Error("Failed to load one or more assets");
    }

    const menuButtonHTML = await menuBtnRes.text();
    const menuHTML = await menuRes.text();
    addMenuJS = await scriptRes.text();

    // Load CSS rule files in parallel
    const cssResponses = await Promise.all(
      CSS_RULES.map((name) => fetch(`injected/css/rules/${name}.css`))
    );

    // Build cssRules object
    const cssRules: CSSRules = {} as CSSRules;
    for (let i = 0; i < CSS_RULES.length; i++) {
      const ruleName = CSS_RULES[i];
      const response = cssResponses[i];

      if (ruleName && response?.ok) {
        cssRules[ruleName] = await response.text();
      } else {
        console.warn(`[JustAgram] Failed to load ${ruleName}.css`);
        if (ruleName) {
          cssRules[ruleName] = "";
        }
      }
    }

    // Store data to be injected
    justagramData = {
      menuButtonHTML,
      menuHTML,
      cssRules,
      settings: loadSettings(),
    };

    console.log("[JustAgram] Assets loaded successfully");
  } catch (e) {
    console.error("[JustAgram] Failed to load assets", e);
    alert("Failed to load JustAgram assets. The app may not function correctly.");
  }
}

async function onDeviceReady(): Promise<void> {
  console.log("Device ready - Launching JustAgram");

  // Load assets before opening browser
  await loadAssets();

  const instagramUrl = "https://www.instagram.com";
  // Added fullscreen=no to show status bar (InAppBrowser defaults to fullscreen=yes)
  const browserOptions =
    "location=no,zoom=no,toolbar=no,footer=no,hardwareback=yes,fullscreen=no";

  // Open Instagram in InAppBrowser
  if (cordova?.InAppBrowser) {
    const browser = cordova.InAppBrowser.open(
      instagramUrl,
      "_blank",
      browserOptions
    );

    // Listen for messages from InAppBrowser
    browser.addEventListener("message", (event: any) => {
      // event.data is already an object if sent via postMessage in cordova-plugin-inappbrowser? 
      // Documentation says it returns an object with 'data' property.
      // However, usually the payload is in event.data.
      console.log("[JustAgram] Message received:", event.data);
      
      try {
        const message = event.data;
        if (message && message.type === 'saveSettings' && message.payload) {
          saveSettings(message.payload);
        }
      } catch (e) {
        console.error("Error handling message", e);
      }
    });

    // Listen for page load completion (Initial load only)
    function onFirstLoad(event: any): void {
      browser.removeEventListener("loadstop", onFirstLoad);

      const url = event.url;
      console.log("[JustAgram] Page loaded (loadstop):", url);

      // First, inject the data as a global variable
      if (justagramData) {
        const dataScript = `window.__JUSTAGRAM_DATA__ = ${JSON.stringify(justagramData)};`;
        browser.insertScript(
          {
            code: dataScript,
          },
          function() {
            console.log("[JustAgram] Data injected successfully");

            // Then inject the menu script that reads from the data
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
        );
      } else {
        console.error("[JustAgram] No data to inject!");
      }
    }
    browser.addEventListener("loadstop", onFirstLoad);

    // Handle errors
    browser.addEventListener("loaderror", function(event: any) {
      console.error("Failed to load Instagram:", event);
      // alert('Failed to load Instagram. Please check your internet connection.');
    });

    // Handle browser close
    browser.addEventListener("exit", function() {
      console.log("Browser closed - Exiting app");
      navigator.app?.exitApp();
    });
  } else {
    console.warn(
      "[JustAgram] InAppBrowser not available. Opening in new tab (CSS Injection will NOT work)."
    );
    window.open(instagramUrl, "_blank");
  }
}
