import type { Settings } from '../../types';

(function() {
  'use strict';

  console.log('[JustAgram] Menu script loaded.');

  // Read data from global variable (injected by main app)
  const data = window.__JUSTAGRAM_DATA__;

  if (!data) {
    console.error('[JustAgram] No data found! Menu cannot be initialized.');
    return;
  }

  const cssRules = data.cssRules;
  const menuButtonHTML = data.menuButtonHTML;
  const menuHTML = data.menuHTML;

  // Default settings (all hidden by default)
  const defaultSettings: Settings = {
    hideReels: true,
    hideStories: true,
    hideExplore: true,
    hideFeed: true,
    hideSuggestedReels: true,
    hideThreads: true
  };

  // Save settings by sending message to main app
  function saveSettings(settings: Settings): void {
    try {
      if (window.webkit?.messageHandlers?.cordova_iab) {
        const message = JSON.stringify({
          type: 'saveSettings',
          payload: settings
        });
        window.webkit.messageHandlers.cordova_iab.postMessage(message);
        console.log('[JustAgram] Settings saved to main app.');
      } else {
        console.warn('[JustAgram] Cannot save settings: message handler not found.');
      }
    } catch (e) {
      console.error('[JustAgram] Failed to save settings:', e);
    }
  }

  // Apply CSS rules based on settings
  function applyStyles(settings: Settings): void {
    const styleId = 'justagram-dynamic-styles';
    const existingStyle = document.getElementById(styleId);
    if (existingStyle) {
      existingStyle.remove();
    }

    let css = '';
    for (const key in settings) {
      if (settings[key as keyof Settings] && cssRules[key as keyof Settings]) {
        css += cssRules[key as keyof Settings] + '\n';
      }
    }

    if (css) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = css;
      document.head.appendChild(style);
    }
  }

  // Initialize menu
  function initMenu(): void {
    console.log('[JustAgram] Initializing menu...');

    // Inject menu button
    const btnContainer = document.createElement('div');
    btnContainer.innerHTML = menuButtonHTML;
    document.body.appendChild(btnContainer.firstElementChild as Node);

    // Inject menu overlay
    const menuContainer = document.createElement('div');
    menuContainer.innerHTML = menuHTML;
    document.body.appendChild(menuContainer.firstElementChild as Node);

    // Use settings provided by main app
    const settings = data?.settings;
    
    const menuBtn = document.getElementById('justagram-menu-btn')!;
    const menuOverlay = document.getElementById('justagram-menu-overlay')!;
    const closeBtn = document.getElementById('justagram-close-btn')!;

    // Helper to toggle visibility based on URL
    function updateButtonVisibility(url: string) {
      if (url.includes('/accounts/settings/')) {
        menuBtn.style.display = 'flex';
      } else {
        menuBtn.style.display = 'none';
      }
    }

    // Handle clicks for navigation
    document.addEventListener('click', function(e) {
      // Find closest anchor tag
      const target = (e.target as HTMLElement).closest('a');
      if (target && target.href) {
        // If it's a settings link, show button. Otherwise, if it's a navigation, hide it.
        if (target.href.includes('/accounts/settings/')) {
          menuBtn.style.display = 'flex';
        } else {
          // We assume any other link is a navigation away
          menuBtn.style.display = 'none';
        }
      }
    });

    // Handle back/forward navigation
    window.addEventListener('popstate', function() {
      updateButtonVisibility(window.location.href);
    });

    // Check initial URL (in case we reload on the settings page)
    updateButtonVisibility(window.location.href);

    // RGB to Hex helper
    function rgbToHex(rgb: string): string {
      const result = rgb.match(/\d+/g);
      if (!result || result.length < 3) return '#000000';
      const r = parseInt(result[0] || '0');
      const g = parseInt(result[1] || '0');
      const b = parseInt(result[2] || '0');
      return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
    }

    // Check and update status bar color
    let lastColor = '';
    function updateStatusBarColor() {
      const mainEl = document.querySelector('main') || document.body;
      if (mainEl) {
        const style = window.getComputedStyle(mainEl);
        const bgColor = style.backgroundColor;
        
        // Convert to hex
        const hexColor = rgbToHex(bgColor);

        // Only send if changed
        if (hexColor !== lastColor) {
          lastColor = hexColor;
          if (window.webkit?.messageHandlers?.cordova_iab) {
            const message = JSON.stringify({
              type: 'updateBackgroundColor',
              payload: hexColor
            });
            window.webkit.messageHandlers.cordova_iab.postMessage(message);
          }
        }
      }
    }

    // Run immediately and then every 2 seconds
    updateStatusBarColor();
    setInterval(updateStatusBarColor, 2000);

    // Send ping every 5 seconds to keep the session alive
    setInterval(() => {
      if (window.webkit?.messageHandlers?.cordova_iab) {
        window.webkit.messageHandlers.cordova_iab.postMessage(JSON.stringify({ type: 'ping' }));
      }
    }, 5000);

    // Open menu
    menuBtn.addEventListener('click', function() {
      (menuOverlay as HTMLElement).style.display = 'flex';
    });

    // Close menu
    closeBtn.addEventListener('click', function() {
      (menuOverlay as HTMLElement).style.display = 'none';
    });

    // Close on overlay click
    menuOverlay.addEventListener('click', function(e: Event) {
      if (e.target === menuOverlay) {
        (menuOverlay as HTMLElement).style.display = 'none';
      }
    });

    // Initialize toggles
    const toggleItems = document.querySelectorAll('.justagram-toggle-item');
    toggleItems.forEach(function(item) {
      const key = item.getAttribute('data-key') as keyof Settings;
      const slider = item.querySelector('.justagram-slider') as HTMLElement;

      // Set initial state from saved settings
      const currentSettings = settings || defaultSettings;
      const isChecked = currentSettings[key];
      updateSliderStyle(slider, isChecked);

      // Handle clicks on the entire toggle row
      (item as HTMLElement).style.cursor = 'pointer';
      item.addEventListener('click', function(e: Event) {
        e.preventDefault();
        e.stopPropagation();

        // Toggle the state
        currentSettings[key] = !currentSettings[key];
        console.log('[JustAgram] Toggle changed:', key, '->', currentSettings[key]);

        updateSliderStyle(slider, currentSettings[key]);
        saveSettings(currentSettings);
        applyStyles(currentSettings);
      });
    });

    // Apply initial styles
    applyStyles(settings || defaultSettings);
    console.log('[JustAgram] Menu initialized.');
  }

  // Update slider visual style
  function updateSliderStyle(slider: HTMLElement, isChecked: boolean): void {
    if (isChecked) {
      slider.style.backgroundColor = '#E1306C';
      slider.innerHTML = '<span style="position:absolute;height:22px;width:22px;left:2px;bottom:3px;background-color:white;transition:.3s;border-radius:50%;transform:translateX(20px);"></span>';
    } else {
      slider.style.backgroundColor = '#363636';
      slider.innerHTML = '<span style="position:absolute;height:22px;width:22px;left:2px;bottom:3px;background-color:white;transition:.3s;border-radius:50%;transform:translateX(0);"></span>';
    }
  }

  // Also add base styles for loading states
  const baseStyles = document.createElement('style');
  baseStyles.textContent = 'div[data-visualcompletion="loading-state"]{display:none!important}';
  document.head.appendChild(baseStyles);

  // Run init
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMenu);
  } else {
    initMenu();
  }
})();
