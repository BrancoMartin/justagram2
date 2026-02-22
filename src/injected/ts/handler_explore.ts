(function() {
  window.JustagramDOMHandlers = window.JustagramDOMHandlers || {};

  window.JustagramDOMHandlers['/explore/'] = function handleExplore() {
    console.log("[JustAgram] Handling DOM for Explore page");
  };

  console.log('[JustAgram] Registered handler for /explore/');
})();
