"use client";

import { useState, useEffect } from "react";
import { isDiscoverPanelOpen } from "../utils/uiHelpers";
import "../styles/burger.css";

/**
 * Componente BurgerMenu standalone che sarà visibile solo dopo la splash screen e non durante il discover
 */
export default function StandaloneBurgerMenu({ onToggle, isOpen }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Funzione per verificare se siamo oltre la splash screen
    const checkVisibility = () => {
      // Nascondi nella splash screen (prime 100vh)
      const shouldShow = window.scrollY > window.innerHeight * 0.9;

      // Nascondi anche se il pannello discover è aperto
      const discoverOpen = isDiscoverPanelOpen();

      setIsVisible(shouldShow && !discoverOpen);
    };

    // Evento scroll
    window.addEventListener("scroll", checkVisibility);

    // Check periodico per il pannello discover
    const interval = setInterval(checkVisibility, 300);

    // Check iniziale
    checkVisibility();

    return () => {
      window.removeEventListener("scroll", checkVisibility);
      clearInterval(interval);
    };
  }, []);

  return (
    <div
      className={`fixed top-6 right-6 md:hidden transition-opacity duration-300 ${
        isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      style={{ zIndex: 12000 }}
    >
      <button
        className="burger-menu burger-menu-standalone"
        onClick={onToggle}
        aria-label={isOpen ? "Chiudi menu" : "Apri menu"}
        aria-expanded={isOpen}
      >
        <div className={`burger-lines ${isOpen ? "open" : ""}`}></div>
      </button>
    </div>
  );
}
