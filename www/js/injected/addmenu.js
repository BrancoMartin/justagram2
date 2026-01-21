(function() {
  'use strict';

  console.log('[JustAgram] Menu script loaded.');

  // CSS rules mapped to toggle keys (injected at build time)
  var cssRules = __CSS_RULES__;

  // Default settings (all hidden by default)
  var defaultSettings = {
    hideReels: true,
    hideStories: true,
    hideExplore: true,
    hideFeed: true,
    hideSuggestedReels: true,
    hideThreads: true
  };

  // Load settings from localStorage
  function loadSettings() {
    try {
      var saved = localStorage.getItem('justagram_settings');
      if (saved) {
        return Object.assign({}, defaultSettings, JSON.parse(saved));
      }
    } catch (e) {
      console.error('[JustAgram] Failed to load settings:', e);
    }
    return Object.assign({}, defaultSettings);
  }

  // Save settings to localStorage
  function saveSettings(settings) {
    try {
      localStorage.setItem('justagram_settings', JSON.stringify(settings));
    } catch (e) {
      console.error('[JustAgram] Failed to save settings:', e);
    }
  }

  // Apply CSS rules based on settings
  function applyStyles(settings) {
    var styleId = 'justagram-dynamic-styles';
    var existingStyle = document.getElementById(styleId);
    if (existingStyle) {
      existingStyle.remove();
    }

    var css = '';
    for (var key in settings) {
      if (settings[key] && cssRules[key]) {
        css += cssRules[key] + '\n';
      }
    }

    if (css) {
      var style = document.createElement('style');
      style.id = styleId;
      style.textContent = css;
      document.head.appendChild(style);
    }
  }

  // HTML templates (injected at build time via JSON.stringify)
  var menuButtonHTML = __MENU_BUTTON_HTML__;
  var menuHTML = __MENU_HTML__;

  // Initialize menu
  function initMenu() {
    console.log('[JustAgram] Initializing menu...');

    // Inject menu button
    var btnContainer = document.createElement('div');
    btnContainer.innerHTML = menuButtonHTML;
    document.body.appendChild(btnContainer.firstElementChild);

    // Inject menu overlay
    var menuContainer = document.createElement('div');
    menuContainer.innerHTML = menuHTML;
    document.body.appendChild(menuContainer.firstElementChild);

    var settings = loadSettings();
    var menuBtn = document.getElementById('justagram-menu-btn');
    var menuOverlay = document.getElementById('justagram-menu-overlay');
    var closeBtn = document.getElementById('justagram-close-btn');

    // Open menu
    menuBtn.addEventListener('click', function() {
      menuOverlay.style.display = 'flex';
    });

    // Close menu
    closeBtn.addEventListener('click', function() {
      menuOverlay.style.display = 'none';
    });

    // Close on overlay click
    menuOverlay.addEventListener('click', function(e) {
      if (e.target === menuOverlay) {
        menuOverlay.style.display = 'none';
      }
    });

    // Initialize toggles
    var toggleItems = document.querySelectorAll('.justagram-toggle-item');
    toggleItems.forEach(function(item) {
      var key = item.getAttribute('data-key');
      var slider = item.querySelector('.justagram-slider');

      // Set initial state from saved settings
      var isChecked = settings[key];
      updateSliderStyle(slider, isChecked);

      // Handle clicks on the entire toggle row
      item.style.cursor = 'pointer';
      item.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();

        // Toggle the state
        settings[key] = !settings[key];
        console.log('[JustAgram] Toggle changed:', key, '->', settings[key]);

        updateSliderStyle(slider, settings[key]);
        saveSettings(settings);
        applyStyles(settings);
      });
    });

    // Apply initial styles
    applyStyles(settings);
    console.log('[JustAgram] Menu initialized.');
  }

  // Update slider visual style
  function updateSliderStyle(slider, isChecked) {
    if (isChecked) {
      slider.style.backgroundColor = '#E1306C';
      slider.innerHTML = '<span style="position:absolute;height:22px;width:22px;left:2px;bottom:3px;background-color:white;transition:.3s;border-radius:50%;transform:translateX(20px);"></span>';
    } else {
      slider.style.backgroundColor = '#363636';
      slider.innerHTML = '<span style="position:absolute;height:22px;width:22px;left:2px;bottom:3px;background-color:white;transition:.3s;border-radius:50%;transform:translateX(0);"></span>';
    }
  }

  // Also add base styles for loading states
  var baseStyles = document.createElement('style');
  baseStyles.textContent = 'div[data-visualcompletion="loading-state"]{display:none!important}';
  document.head.appendChild(baseStyles);

  // Run init
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMenu);
  } else {
    initMenu();
  }
})();
