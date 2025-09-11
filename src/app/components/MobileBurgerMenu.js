"use client";

import { useState, useEffect, useRef } from "react";
import "../styles/mobile-burger.css";

export default function MobileBurgerMenu({ hide = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const menuRef = useRef(null);

  // Controlla la visibilità in base allo scroll e alla splash screen
  useEffect(() => {
    const handleScroll = () => {
      // Controlla se la splash screen è scomparsa
      const splashGone =
        document.documentElement.classList.contains("splash-completed");

      // Controlla se siamo nella sezione home
      const scrollY = window.scrollY;
      const homeSection = document.querySelector(".home-section");
      const inHomeSection =
        homeSection &&
        scrollY < homeSection.offsetTop + homeSection.offsetHeight - 50; // 50px di margine

      // Mostra il menu solo se la splash è scomparsa e siamo nella home section
      setIsVisible(splashGone && inHomeSection);
    };

    // Callback per l'observer che osserva quando viene aggiunta la classe splash-completed
    const checkSplashCompletion = () => {
      if (document.documentElement.classList.contains("splash-completed")) {
        handleScroll(); // Controlla la visibilità dopo la splash
        window.addEventListener("scroll", handleScroll);
      }
    };

    // Observer per rilevare quando la splash è scomparsa
    const observer = new MutationObserver(checkSplashCompletion);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Funzione per toggle del menu
  const toggleMenu = () => {
    setIsOpen(!isOpen);
    // Blocca/sblocca lo scroll quando il menu è aperto/chiuso
    if (!isOpen) {
      document.body.classList.add("menu-open");
    } else {
      document.body.classList.remove("menu-open");
    }
  };

  // Chiudi il menu quando si clicca su un link
  const handleLinkClick = () => {
    setIsOpen(false);
    document.body.classList.remove("menu-open");
  };

  if (!isVisible || hide) return null;

  return (
    <>
      {/* Burger Button */}
      <button
        className={`mobile-burger-button ${isOpen ? "open" : ""}`}
        onClick={toggleMenu}
        aria-label="Menu di navigazione"
        aria-expanded={isOpen}
        style={hide ? { pointerEvents: "none", opacity: 0 } : {}}
      >
        <div className="burger-icon"></div>
        <div className="burger-icon"></div>
        <div className="burger-icon"></div>
      </button>

      {/* Menu Mobile */}
      <div
        className={`mobile-menu ${isOpen ? "open" : ""}`}
        ref={menuRef}
        aria-hidden={!isOpen}
        style={hide ? { pointerEvents: "none", opacity: 0 } : {}}
      >
        <div className="mobile-menu-container">
          <a href="#" className="mobile-menu-link" onClick={handleLinkClick}>
            HOME
          </a>
          <a href="#" className="mobile-menu-link" onClick={handleLinkClick}>
            COLLEZIONE
          </a>
          <a href="#" className="mobile-menu-link" onClick={handleLinkClick}>
            EXPLORE
          </a>
          <a href="#" className="mobile-menu-link" onClick={handleLinkClick}>
            PROSSIMAMENTE
          </a>
          
        </div>
      </div>

      {/* Overlay quando il menu è aperto */}
      {isOpen && !hide && (
        <div
          className="mobile-menu-overlay"
          onClick={toggleMenu}
          aria-hidden="true"
        ></div>
      )}
    </>
  );
}
