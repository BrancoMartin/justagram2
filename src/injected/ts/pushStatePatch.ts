function handleHome() {
  const article = document.querySelector("article");
  if (article) {
    const div = article.closest("div");
    if (div) {
      div.remove();
      console.log("[JustAgram] Removed div containing article on Home");
    }
  }
}

function handleNavigation() {
  const path = window.location.pathname;
  console.log(`[JustAgram] Navigated to: ${path}`);

  if (path === "/") {
    // We might need to wait for content to load
    setTimeout(handleHome, 1);
    setTimeout(handleHome, 500);
    setTimeout(handleHome, 1000);
  }
}

// Patch pushState
const pushState = history.pushState;
history.pushState = function (...args) {
  pushState.apply(this, args);
  handleNavigation();
};

// Patch replaceState
const replaceState = history.replaceState;
history.replaceState = function (...args) {
  replaceState.apply(this, args);
  handleNavigation();
};

// Back/forward navigation
window.addEventListener("popstate", handleNavigation);

// Initial load
handleNavigation();
