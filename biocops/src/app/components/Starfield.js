"use client";

import { useEffect, useRef } from "react";

const HERO_STARS = [
  {
    x: "50%",
    y: "50%",
    finalX: "3.4%",
    finalY: "6.99%",
    size: 1.9,
    duration: "1.2s",
    delay: "0.3s",
  },
  {
    x: "50%",
    y: "50%",
    finalX: "19.4%",
    finalY: "3.59%",
    size: 2.8,
    duration: "1.3s",
    delay: "0.8s", // Maggior delay
  },
  {
    x: "50%",
    y: "50%",
    finalX: "92.4%",
    finalY: "12.59%",
    size: 2.5,
    duration: "0.9s",
    delay: "1.5s", // Aumentato il delay
  },
  {
    x: "50%",
    y: "50%",
    finalX: "72.4%",
    finalY: "3.59%",
    size: 2.3,
    duration: "1.5s",
    delay: "0.6s", // Delay casuale
  },
  {
    x: "50%",
    y: "50%",
    finalX: "95.4%",
    finalY: "32.59%",
    size: 2.8,
    duration: "1.0s",
    delay: "2.1s", // Aumentato significativamente il delay
  },
  {
    x: "50%",
    y: "50%",
    finalX: "88.4%",
    finalY: "17.7%",
    size: 1.4,
    duration: "1.0s",
    delay: "1.2s", // Delay casuale
  },
  {
    x: "50%",
    y: "50%",
    finalX: "10.4%",
    finalY: "51.59%",
    size: 2.1,
    duration: "1.2s",
    delay: "2.8s", // Delay più lungo
  },
  {
    x: "50%",
    y: "50%",
    finalX: "4.4%",
    finalY: "41.99%",
    size: 1,
    duration: "1.0s",
    delay: "1.9s", // Delay casuale
  },
  {
    x: "50%",
    y: "50%",
    finalX: "16.4%",
    finalY: "48.99%",
    size: 1,
    duration: "0.9s",
    delay: "3.5s", // Delay molto più lungo
  },
  {
    x: "50%",
    y: "50%",
    finalX: "12.4%",
    finalY: "45.99%",
    size: 0.6,
    duration: "0.8s",
    delay: "3.2s", // Delay molto più lungo
  },
  {
    x: "50%",
    y: "50%",
    finalX: "98.5%",
    finalY: "2%",
    size: 0.6,
    duration: "1.5s",
    delay: "5.5s", // Delay calcolato per finire quasi alla fine della splash screen (totale ~7s)
  },
];

export default function Starfield({ inSplashScreen = false }) {
  const starfieldRef = useRef(null);

  useEffect(() => {
    // Rimosso l'observer che metteva in pausa le stelle quando non erano visibili
    // Ora le stelle rimarranno sempre attive, anche durante lo scroll verso altre sezioni

    if (starfieldRef.current) {
      // Add appeared class after animation
      const stars = starfieldRef.current.getElementsByClassName("star");
      Array.from(stars).forEach((star, index) => {
        const delay =
          parseFloat(getComputedStyle(star).getPropertyValue("--delay")) * 1000;
        const duration =
          parseFloat(getComputedStyle(star).getPropertyValue("--duration")) *
          1000;

        // Aggiungiamo la classe "appeared" subito dopo l'animazione
        // Ci assicuriamo che anche le stelle con delay più lunghi ricevano la classe
        setTimeout(() => {
          if (star && !star.classList.contains("appeared")) {
            star.classList.add("appeared");
          }
        }, delay + duration);

        // Applica rotazioni casuali solo sul client dopo l'idratazione
        // Questo evita discrepanze tra server e client
        const randomRotation = Math.random() * 360;
        setTimeout(() => {
          star.style.setProperty("--cross-rot", `${randomRotation}deg`);
        }, 0);
      });
    }

    // Non c'è più necessità di rimuovere l'observer poiché non lo stiamo usando
  }, []);

  return (
    <div ref={starfieldRef} className="starfield">
      {HERO_STARS.map((star, index) => {
        // Utilizziamo valori deterministici per l'angolo di rotazione basati sull'indice
        // Questo garantisce che server e client generino gli stessi valori
        const crossRot = ((index * 47) % 360) - 90;

        // Usa l'indice per generare un delay deterministico
        const twinkleDelay = ((index * 1.618) % 8).toFixed(2); // Usa la sezione aurea per una distribuzione naturale
        
        const style = {
          "--initial-x": "50%",
          "--initial-y": "50%",
          "--final-x": star.finalX,
          "--final-y": star.finalY,
          width: `${star.size}px`,
          height: `${star.size}px`,
          "--delay": star.delay,
          "--duration": star.duration,
          "--cross-rot": `${crossRot}deg`,
          "--twinkle-delay": `${twinkleDelay}s`,
        };

        // Se siamo nella splash screen, usiamo la classe "star splash-star" altrimenti solo "star"
        const className = inSplashScreen ? "star splash-star" : "star";
        return <div key={index} className={className} style={style} />;
      })}
    </div>
  );
}
