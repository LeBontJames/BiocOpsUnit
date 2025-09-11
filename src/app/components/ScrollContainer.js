"use client";
import { useRef, useEffect, useState } from "react";
import Starfield from "./Starfield";
import SpiralGalaxy from "./SpiralGalaxy";

export default function ScrollContainer({ children, showGalaxy }) {
  const containerRef = useRef(null);
  const [scrollPercentage, setScrollPercentage] = useState(0);
  const [isInHomeSection, setIsInHomeSection] = useState(true);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const viewportHeight = window.innerHeight;
      const firstSectionHeight = viewportHeight;

  // Calcola posizione e altezza reale della seconda sezione
  const secondSection = document.querySelector('.second-section');
  const secondSectionTop = secondSection ? secondSection.offsetTop : firstSectionHeight;
  const secondSectionHeight = secondSection ? secondSection.offsetHeight : viewportHeight;

  // Calcola posizione e altezza reale della terza sezione
  const thirdSection = document.querySelector('.third-section');
  const thirdSectionTop = thirdSection ? thirdSection.offsetTop : secondSectionTop + secondSectionHeight;
  const thirdSectionHeight = thirdSection ? thirdSection.offsetHeight : viewportHeight;

      const currentScroll = container.scrollTop;

      let percentage = 0;
      let rotation = 0;
      let scale = 1;

      if (currentScroll < firstSectionHeight) {
        // Prima sezione
        percentage = Math.min(currentScroll / firstSectionHeight, 1);
        rotation = percentage * 360;
        scale = 1 - percentage * 0.2;
        setIsInHomeSection(true);
      } else if (currentScroll < secondSectionTop + secondSectionHeight) {
        // Seconda sezione
        const secondScroll = currentScroll - secondSectionTop;
        percentage = Math.min(Math.max(secondScroll / secondSectionHeight, 0), 1);
        if (percentage === 0) {
          rotation = 360;
        } else if (percentage === 1) {
          rotation = 720;
        } else {
          rotation = 360 + percentage * 360; // da 360° a 720°
        }
        scale = 0.8 - percentage * 0.2;    // da 0.8 a 0.6
        setIsInHomeSection(false);
      } else if (currentScroll < thirdSectionTop + thirdSectionHeight) {
        // Terza sezione
        const thirdScroll = currentScroll - thirdSectionTop;
        percentage = Math.min(Math.max(thirdScroll / thirdSectionHeight, 0), 1);
        if (percentage === 0) {
          rotation = 720;
        } else if (percentage === 1) {
          rotation = 1080;
        } else {
          rotation = 720 + percentage * 360; // da 720° a 1080°
        }
        scale = 0.6 - percentage * 0.2;    // da 0.6 a 0.4
        setIsInHomeSection(false);
      } else {
        // Dopo la terza sezione
        rotation = 1080;
        scale = 0.4;
        setIsInHomeSection(false);
      }

      setScrollPercentage(percentage);

      const logoElement = document.getElementById("home-logo");
      if (logoElement) {
        logoElement.style.transform = `rotate(${rotation}deg) scale(${scale})`;
        // Log per debug
        console.log(
          `Scroll: ${percentage.toFixed(2)}, Scale: ${scale.toFixed(2)}, Rotation: ${rotation.toFixed(0)}, In Home: ${isInHomeSection}`
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
      {/* Animazione galassia visibile solo nella home section e dopo la splash */}
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
