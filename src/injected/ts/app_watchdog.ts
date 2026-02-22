(function() {
    // Send ping every 5 seconds to keep the session alive
    setInterval(() => {
      if (window.webkit?.messageHandlers?.cordova_iab) {
        window.webkit.messageHandlers.cordova_iab.postMessage(JSON.stringify({ type: 'ping' }));
      }
    }, 5000);
    console.log('[JustAgram] Watchdog pinger active');
})();
