"use client";

import { useState, useEffect, useRef } from "react";
import "../styles/burger.css";

export default function BurgerMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const homeSectionRef = useRef(null);
  const secondSectionRef = useRef(null);
  const splashScreenRef = useRef(null);

  useEffect(() => {
    // Trova le sezioni rilevanti
    const splashScreen = document.querySelector(".splash-screen");
    const homeSection = document.querySelector(".home-section");
    const sections = document.querySelectorAll(".scroll-section");
    const secondSection = sections[1]; // La sezione dopo la home

    if (splashScreen) splashScreenRef.current = splashScreen;
    if (homeSection) homeSectionRef.current = homeSection;
    if (secondSection) secondSectionRef.current = secondSection;

    const handleScroll = () => {
      // Se non abbiamo riferimenti validi, il burger menu rimane nascosto per sicurezza
      if (
        !splashScreenRef.current ||
        !homeSectionRef.current ||
        !secondSectionRef.current
      ) {
        setIsVisible(false);
        return;
      }

      const scrollPosition = window.scrollY;
      const splashScreenHeight = splashScreenRef.current.offsetHeight;
      const homeSectionBottom =
        homeSectionRef.current.offsetTop + homeSectionRef.current.offsetHeight;
      const secondSectionBottom =
        secondSectionRef.current.offsetTop +
        secondSectionRef.current.offsetHeight;

      // Visibile solo dopo lo splash screen, nella home e nella seconda sezione
      const isPastSplashScreen = scrollPosition >= splashScreenHeight * 0.9; // 90% dello splash screen
      const isInHomeOrSecond = scrollPosition < secondSectionBottom;

      // Il burger menu è visibile solo se siamo oltre lo splash screen E siamo nella home o nella seconda sezione
      const shouldBeVisible = isPastSplashScreen && isInHomeOrSecond;

      setIsVisible(shouldBeVisible);

      // Se usciamo dalle sezioni consentite e il menu è aperto, lo chiudiamo
      if (!shouldBeVisible && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    // Controlla subito la visibilità
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isOpen]);

  // Gestisce apertura/chiusura del menu
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  // Navigazione mobile
  const mobileLinks = [
    { href: "#", text: "HOME" },
    { href: "#", text: "RISULTATI" },
    { href: "#", text: "TORNEI" },
    { href: "#", text: "PROSSIMAMENTE" },
    { href: "#", text: "LIVE" },
  ];

  if (!isVisible) {
    return null;
  }

  return (
    <div className="burger-menu-container">
      <button
        className="burger-button"
        onClick={toggleMenu}
        aria-label="Menu di navigazione"
      >
        <div className={`burger-lines ${isOpen ? "open" : ""}`}></div>
      </button>

      {isOpen && (
        <div className="mobile-menu">
          {mobileLinks.map((link, index) => (
            <a
              key={index}
              href={link.href}
              className="mobile-menu-item"
              onClick={() => setIsOpen(false)}
            >
              {link.text}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
