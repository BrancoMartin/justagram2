(function() {
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
    console.log('[JustAgram] StatusBar manager active');
})();
