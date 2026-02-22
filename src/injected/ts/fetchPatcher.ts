
// Define the global interface
interface JustagramBlockerAPI {
  add: (substring: string) => void;
  clear: () => void;
  print: () => void;
  isBlocked: (url: string) => boolean;
}

declare global {
  interface Window {
    JustagramBlocker: JustagramBlockerAPI;
  }
}

(function() {
  const originalFetch = window.fetch;
  const originalXHROpen = window.XMLHttpRequest.prototype.open;
  const originalXHRSend = window.XMLHttpRequest.prototype.send;
  
  // The active blocklist for the current page
  const blocklist = new Set<string>();

  // Expose the API
  window.JustagramBlocker = {
    add: (substring: string) => {
      blocklist.add(substring);
      console.log(`[JustAgram] 🚫 Blocking substring: "${substring}"`);
    },
    clear: () => {
      if (blocklist.size > 0) {
        console.log(`[JustAgram] 🧹 Clearing blocklist (${blocklist.size} items)`);
        blocklist.clear();
      }
    },
    isBlocked: (url: string) => {
      for (const substring of blocklist) {
        if (url.includes(substring)) return true;
      }
      return false;
    },
    print: () => {
      console.log(`[JustAgram] 🧾 Current blocklist:`, Array.from(blocklist));
    }
  };

  // Helper to create empty response
  function createErrorResponse(url: string): Response {
    console.log('[JustAgram] 🛑 Blocked request:', url);

    // return new Response(JSON.stringify(body), {
    //   status: 200,
    //   headers: { 'Content-Type': 'application/json' }
    // });

    return new Response(null, {
      status: 500,
    });
  }

  // Patch fetch
  window.fetch = async function (input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    let url = '';
    if (typeof input === 'string') {
      url = input;
    } else if (input instanceof URL) {
      url = input.toString();
    } else if (input instanceof Request) {
      url = input.url;
    }

    if (window.JustagramBlocker.isBlocked(url)) {
      return createErrorResponse(url);
    }

    return originalFetch.apply(this, arguments as any);
  };

  // Patch XHR Open
  window.XMLHttpRequest.prototype.open = function (method: string, url: string | URL) {
    // Store URL on the XHR instance for checking in send()
    (this as any)._url = url.toString();
    return originalXHROpen.apply(this, arguments as any);
  };
  
  // Patch XHR Send
  window.XMLHttpRequest.prototype.send = function (body?: Document | XMLHttpRequestBodyInit | null) {
    const url = (this as any)._url;
    if (url && window.JustagramBlocker.isBlocked(url)) {
       console.log('[JustAgram] 🛑 Blocked XHR:', url);
       
      // error response
        Object.defineProperty(this, 'status', { value: 500 });
        Object.defineProperty(this, 'readyState', { value: 4 });
        Object.defineProperty(this, 'responseText', { value: null });
        Object.defineProperty(this, 'response', { value: null });

       
       // Trigger events
       setTimeout(() => {
         if (this.onreadystatechange) this.onreadystatechange(new Event('readystatechange'));
         if (this.onload) this.onload(new Event('load'));
       }, 0);
       
       return;
    }
    return originalXHRSend.apply(this, arguments as any);
  };

  console.log('[JustAgram] 🛡️ Dynamic Fetch Patcher Active');
})();
