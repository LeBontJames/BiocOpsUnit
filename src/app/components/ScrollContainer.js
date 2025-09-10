"use client";
import { useRef, useEffect, useState } from "react";
import Starfield from "./Starfield";

export default function ScrollContainer({ children }) {
  const containerRef = useRef(null);
  const [scrollPercentage, setScrollPercentage] = useState(0);
  const [isInHomeSection, setIsInHomeSection] = useState(true);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      // Calcola l'altezza visibile della prima sezione
      const viewportHeight = window.innerHeight;
      const firstSectionHeight = viewportHeight;

      // Calcola la percentuale di scroll rispetto alla prima sezione
      const currentScroll = container.scrollTop;
      const percentage = Math.min(currentScroll / firstSectionHeight, 1);

      setScrollPercentage(percentage);

      // Determina se siamo nella sezione home (percentuale < 0.5) o nella seconda sezione
      setIsInHomeSection(percentage < 0.5);

      // Trova il logo usando il selettore ID (più specifico)
      const logoElement = document.getElementById("home-logo");
      if (logoElement) {
        // Rotazione da 0 a 360 gradi
        const rotation = percentage * 360;
        // Scala: inizia a 1 e diminuisce fino a 0.8 (riduzione del 20%)
        const scale = 1 - percentage * 0.2;

        // Applica entrambe le trasformazioni
        logoElement.style.transform = `rotate(${rotation}deg) scale(${scale})`;

        // Log per debug
        console.log(
          `Scroll: ${percentage.toFixed(2)}, Scale: ${scale.toFixed(
            2
          )}, In Home: ${isInHomeSection}`
        );
      } else {
        console.warn("Logo element not found!");
      }
    };

    // Inizializza lo stato del logo
    handleScroll();

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* Starfield posizionato come overlay fisso ma visibile solo nella home */}
      <div
        className={`fixed-starfield-container ${
          isInHomeSection ? "visible" : "hidden"
        }`}
      >
        <Starfield />
      </div>
      <div ref={containerRef} className="scroll-container">
        {children}
      </div>
    </>
  );
}
