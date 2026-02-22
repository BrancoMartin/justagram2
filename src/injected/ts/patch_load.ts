(function() {
  // Also add base styles for loading states
  const baseStyles = document.createElement('style');
  baseStyles.textContent = 'div[data-visualcompletion="loading-state"]{display:none!important}';
  document.head.appendChild(baseStyles);
  console.log('[JustAgram] Loading patch applied');
})();
