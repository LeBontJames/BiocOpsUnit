"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import "../styles/splash.css";
import Starfield from "./Starfield";
import BigBangAnimation from "./BigBangAnimation";

export default function SplashScreen() {
  const [isFading, setIsFading] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [showBigBang, setShowBigBang] = useState(true);
  const [bigBangFading, setBigBangFading] = useState(false); // Stato per la dissolvenza dell'animazione Big Bang
  const [showOriginalSplash, setShowOriginalSplash] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;

    const preloadImages = () => {
      const logoImg = new window.Image();
      const ringImg = new window.Image();
      
      let loadedCount = 0;
      const checkAllLoaded = () => {
        loadedCount++;
        if (loadedCount === 2 && mounted) {
          // Piccolo delay per assicurarci che il DOM sia pronto
          setTimeout(() => {
            setImagesLoaded(true);
          }, 100);
        }
      };
      
      logoImg.onload = checkAllLoaded;
      ringImg.onload = checkAllLoaded;
      
      // Gestione errori
      logoImg.onerror = () => {
        console.error('Error loading logo image');
        if (mounted) setImagesLoaded(true);
      };
      ringImg.onerror = () => {
        console.error('Error loading ring image');
        if (mounted) setImagesLoaded(true);
      };
      
      logoImg.src = '/logosplash.PNG';
      ringImg.src = '/Sbioccing Flow circolare senza scimmia.PNG';
    };
    
    preloadImages();

    // Cleanup function
    return () => {
      mounted = false;
    };
  }, []);

  // Completamento animazione Big Bang
  const handleBigBangComplete = () => {
    // Non nascondiamo più il componente BigBang, manteniamo l'ultimo frame visibile
    // setShowBigBang(false);
    
    // Mostriamo immediatamente la splash screen, ma utilizziamo il precaricamento di next/image con priority
    setShowOriginalSplash(true);
    
    // La barra di progresso della splash originale impiega 3 secondi per completarsi
    setTimeout(() => {
      // Avviamo la dissolvenza sia della splash screen che dell'animazione Big Bang
      setIsFading(true);
      setBigBangFading(true);
      
      // Dopo la dissolvenza di 1s, nascondiamo completamente la splash
      setTimeout(() => {
        setIsHidden(true);
        // Segnaliamo che la splash screen è stata completamente rimossa
        document.documentElement.classList.add("splash-completed");
      }, 1000);
    }, 3000);
  };

  if (isHidden) return null;

  return (
    <>
      {/* Animazione Big Bang - sempre presente come sfondo */}
      {showBigBang && (
        <div 
          style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            width: '100%', 
            height: '100%', 
            zIndex: 9990,
            opacity: bigBangFading ? 0 : 1, 
            transition: 'opacity 1s ease, filter 1s ease',
            filter: bigBangFading ? 'blur(6px)' : 'none'
          }}
        >
          <BigBangAnimation onComplete={handleBigBangComplete} />
        </div>
      )}
      
      {/* Splash screen originale */}
      {showOriginalSplash && imagesLoaded && (
        <div className={`splash-screen ${isFading ? "is-fading" : ""}`} style={{ position: 'relative', zIndex: 9995 }}>
          <div className="splash-phase2">
            {/* Riattivo Starfield per mostrare le stelle sopra l'animazione Big Bang */}
            <div className="starfield" aria-hidden="true" style={{ position: 'absolute', zIndex: 9991 }}>
              <Starfield inSplashScreen={true} />
            </div>
            <Image
              src="/logosplash.PNG"
              alt="ClutchPoint Logo"
              width={600}
              height={300}
              className="splash-logo"
              priority
              style={{
                position: 'absolute',
                top: 'calc(50% - 50px)',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                opacity: imagesLoaded ? undefined : 0 // Garantisce che l'immagine sia visibile solo quando caricata
              }}
            />
            <Image
              src="/Sbioccing Flow circolare senza scimmia.PNG"
              alt="Sbioccing Flow"
              width={600}
              height={300}
              className="splash-ring"
              priority
              style={{
                position: 'absolute',
                top: 'calc(50% - 50px)',
                left: '50%',
                opacity: imagesLoaded ? undefined : 0 // Garantisce che l'immagine sia visibile solo quando caricata
              }}
            />
            <div className="splash-text">Sbioccing&apos;...</div>
            <div className="splash-progress">
              <div className="splash-progress__bar"></div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
