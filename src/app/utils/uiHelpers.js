/**
 * Controlla se il pannello discover è attualmente aperto
 * @returns {boolean} true se il pannello è aperto, false altrimenti
 */
export function isDiscoverPanelOpen() {
  if (typeof window !== "undefined") {
    const discoverPanel = document.querySelector(".discover-panel");
    const discoverOverlay = document.querySelector(".discover-overlay");

    // Controlla sia il pannello che l'overlay
    const isPanelOpen =
      discoverPanel && discoverPanel.getAttribute("aria-hidden") === "false";
    const isOverlayOpen =
      discoverOverlay &&
      discoverOverlay.getAttribute("aria-hidden") === "false";

    return isPanelOpen || isOverlayOpen;
  }
  return false;
}

/**
 * Controlla se l'utente ha superato la splash screen durante lo scroll
 * @returns {boolean} true se lo scroll è oltre la splash screen, false altrimenti
 */
export function hasScrolledPastSplash() {
  if (typeof window !== "undefined") {
    // Consideriamo la splash screen superata solo quando lo scroll è oltre il 90% dell'altezza della viewport
    // Per assicurarci che il burger menu appaia solo dopo aver scrollato oltre la splash screen
    return window.scrollY > window.innerHeight * 0.9;
  }
  return false;
}
