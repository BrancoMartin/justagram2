// Detect if running in a browser (no cordova) or native
if (window.cordova) {
    document.addEventListener('deviceready', onDeviceReady, false);
} else {
    // Fallback for browser testing
    console.log('[JustAgram] Running in browser mode (No Cordova)');
    // Small delay to ensure DOM is ready
    setTimeout(onDeviceReady, 500);
}

let cleanerCSS = '';

async function loadCSS() {
    try {
        console.log('[JustAgram] Loading CSS from css/instagram.css...');
        const response = await fetch('css/instagram.css');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        cleanerCSS = await response.text();
        console.log('[JustAgram] CSS loaded successfully');
    } catch (e) {
        console.error('[JustAgram] Failed to load CSS', e);
        alert('Failed to load Cleaner CSS. The app may not function correctly.');
    }
}

async function onDeviceReady() {
    console.log('Device ready - Launching JustAgram');
    
    // Load CSS before opening browser
    await loadCSS();

    const instagramUrl = 'https://www.instagram.com';
    // Added fullscreen=no to show status bar (InAppBrowser defaults to fullscreen=yes)
    const browserOptions = 'location=no,zoom=no,toolbar=no,footer=no,hardwareback=yes,fullscreen=no';

    // Open Instagram in InAppBrowser
    if (window.cordova && cordova.InAppBrowser) {
        const browser = cordova.InAppBrowser.open(instagramUrl, '_blank', browserOptions);

        // Listen for page load completion (Initial load only)
        browser.addEventListener('loadstop', function(event) {
            const url = event.url;
            console.log('[JustAgram] Page loaded (loadstop):', url);

            // Always inject base CSS
            if (cleanerCSS) {
                browser.insertCSS({
                    code: cleanerCSS
                }, function() {
                    console.log('[JustAgram] Base CSS injected (Scoped rules applied)');
                });
            } else {
                console.error('[JustAgram] No CSS to inject!');
            }

            // Try to inject script via new insertScript method (bypasses eval-based CSP)
            browser.insertScript({
                code: 'console.log("[JustAgram] insertScript test - CSP bypass successful!"); alert("Script injection worked!");'
            }, function() {
                console.log('[JustAgram] Script injected via insertScript');
            });
        });

        // Handle errors
        browser.addEventListener('loaderror', function(event) {
            console.error('Failed to load Instagram:', event);
            // alert('Failed to load Instagram. Please check your internet connection.');
        });

        // Handle browser close
        browser.addEventListener('exit', function() {
            console.log('Browser closed - Exiting app');
            navigator.app.exitApp();
        });
    } else {
        console.warn('[JustAgram] InAppBrowser not available. Opening in new tab (CSS Injection will NOT work).');
        window.open(instagramUrl, '_blank');
    }
}
