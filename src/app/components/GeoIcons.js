"use client";

import { useState, useRef, useEffect } from "react";

export default function GeoIcons({ paused, onModalChange }) {
// Duplicato rimosso
  const [modalOpen, setModalOpen] = useState(false);
  const [activeMedia, setActiveMedia] = useState({
    type: null, // 'video' o 'image'
    src: "",
    message: "",
    position: { top: 0, left: 0 }
  });
  const [isProcessingClick, setIsProcessingClick] = useState(false); // Protezione contro clic multipli
  const [isAnimating, setIsAnimating] = useState(false); // Nuova variabile per tracciare l'animazione in corso
  const [messagePosition, setMessagePosition] = useState('initial'); // 'initial', 'media'
  const videoRef = useRef(null);
  const messageRef = useRef(null);
  const modalRef = useRef(null);
  const contentRef = useRef(null);
  const imgRef = useRef(null);
  const timeoutRef = useRef(null); // Per tenere traccia dei timeout

  // Gestisce l'apertura del modal
  const openModal = (type, src, message, autoclose, event) => {
    if (paused) return; // Blocca interazione se in pausa
    // Protezione contro clic multipli o aperture durante animazioni
    if (modalOpen || isProcessingClick) return;
    setIsProcessingClick(true);
    // Otteniamo le coordinate dell'elemento cliccato
    const iconElement = event.currentTarget;
    const iconRect = iconElement.getBoundingClientRect();
    const iconPosition = {
      top: iconRect.top + window.scrollY + iconRect.height, // Posizionato sotto l'icona
      left: iconRect.left + window.scrollX + (iconRect.width / 2) // Centrato sull'icona orizzontalmente
    };
    
    setActiveMedia({ type, src, message, position: iconPosition });
    
    // Aggiorniamo la posizione del messaggio e mostriamolo
    if (messageRef.current) {
      messageRef.current.style.top = `${iconPosition.top}px`;
      messageRef.current.style.left = `${iconPosition.left}px`;
      messageRef.current.textContent = message;
      messageRef.current.classList.add("show");
      
      // Resettiamo la posizione del messaggio a quella iniziale
      setMessagePosition('initial');
    }
    
    // Impostiamo il flag di animazione in corso
    setIsAnimating(true);
    
    // Riduciamo il tempo di attesa per una risposta più veloce
    timeoutRef.current = setTimeout(() => {
      setModalOpen(true);
      document.body.classList.add("modal-open");
      if (typeof onModalChange === "function") {
        onModalChange(true);
      }
      
      // Preparazione per il media (video o immagine)
      if (type === "video" && videoRef.current) {
        // Impostiamo il video per partire da capo
        videoRef.current.currentTime = 0;
      }
      
      // Spostamento del messaggio in posizione media
      requestAnimationFrame(() => {
        // Cambiamo lo stato della posizione del messaggio
        setMessagePosition('media');
        
        // L'animazione è completata dopo lo spostamento del messaggio
        setTimeout(() => {
          setIsAnimating(false);
        }, 300); // tempo sufficiente per completare la transizione
        
        // L'animazione è completata
        setIsAnimating(false);
      });
    }, 800); // Aumentato da 400ms a 800ms per dare più tempo di leggere il testo

    // Autochiusura se impostata
    if (autoclose && !isNaN(parseInt(autoclose))) {
      const timeout = parseInt(autoclose);
      const autocloseTimeout = setTimeout(() => {
        closeModal();
      }, timeout);
      
      // Salviamo il riferimento per poterlo cancellare in caso di interruzione
      timeoutRef.current = autocloseTimeout;
    }
    
    // Rimuovi il flag di protezione dopo il completamento dell'animazione
    const protectionTimeout = setTimeout(() => {
      setIsProcessingClick(false);
    }, 1000); // Aumentato a 1 secondo per coprire tutta l'animazione
  };

  // Gestisce la chiusura del modal
  const closeModal = () => {
    // Previeni chiusure durante la fase iniziale di animazione a meno che non sia una chiusura forzata
    if (isAnimating && !isProcessingClick) {
      return; // Ignora tentativi di chiusura durante l'animazione
    }
    
    // Pulizia di eventuali timeout in sospeso
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    setModalOpen(false);
    setIsAnimating(false);
    if (typeof onModalChange === "function") {
      onModalChange(false);
    }
    // Reset della posizione del messaggio allo stato iniziale
    setMessagePosition('initial');
    document.body.classList.remove("modal-open");

    // Ferma il video se era in riproduzione
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
    
    // Nasconde il messaggio immediatamente insieme al modale
    if (messageRef.current) {
      // Rimuoviamo tutte le classi immediatamente per far scomparire il messaggio subito
      messageRef.current.classList.remove("show");
      
      // Resettiamo completamente lo stato del messaggio
      messageRef.current.style.opacity = "0";
      
      // Resettiamo completamente dopo un brevissimo istante
      requestAnimationFrame(() => {
        if (messageRef.current) {
          messageRef.current.style.transition = "none"; // Disattiviamo la transizione per reset immediato
          messageRef.current.style.removeProperty("top");
          messageRef.current.style.removeProperty("left");
          
          // Ripristiniamo le transizioni dopo il reset
          requestAnimationFrame(() => {
            if (messageRef.current) {
              messageRef.current.style.removeProperty("transition");
              messageRef.current.style.removeProperty("opacity");
            }
          });
        }
      });
    }
  };

  // Gestisce il click sul modal per chiuderlo quando si clicca fuori dal contenuto
  const handleModalClick = (e) => {
    // Ignora i click se siamo nella fase di animazione
    if (isAnimating) {
      return;
    }
    
    if (modalRef.current === e.target) {
      closeModal();
    }
  };

  // Gestisce il tasto ESC per chiudere il modal
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape" && modalOpen) {
        closeModal();
      }
    };

    window.addEventListener("keydown", handleEsc);
    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
  }, [modalOpen]);

  // Assicura che il video parta in autoplay quando il modal si apre
  useEffect(() => {
    if (modalOpen && activeMedia.type === "video" && videoRef.current) {
      if (paused) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch((err) => {
          console.warn("Autoplay fallito:", err);
          setTimeout(() => {
            videoRef.current?.play().catch(e => console.warn("Secondo tentativo fallito:", e));
          }, 50);
        });
      }

      // Aggiungi event listener per la fine del video
      const videoElement = videoRef.current;
      const handleVideoEnd = () => closeModal();

      videoElement.addEventListener("ended", handleVideoEnd);

      // Pulisci l'event listener quando il componente si smonta o il modal si chiude
      return () => {
        videoElement.removeEventListener("ended", handleVideoEnd);
      };
    }
  }, [modalOpen, activeMedia, paused]);
  
  // Gestisce il posizionamento del messaggio in base allo stato
  useEffect(() => {
    if (!messageRef.current) return;
    
    if (messagePosition === 'media' && modalOpen) {
      // Rimuoviamo prima tutte le classi di posizione per evitare conflitti
      messageRef.current.classList.remove("video-position", "image-position");
      
      // Aggiungiamo la classe comune per tutti i media
      messageRef.current.classList.add("media-position");
      
      // Aggiungiamo la classe specifica in base al tipo di media
      if (activeMedia.type === "video") {
        messageRef.current.classList.add("video-position");
      } else if (activeMedia.type === "image") {
        messageRef.current.classList.add("image-position");
      }
    } else if (messagePosition === 'initial') {
      // Rimuoviamo le classi di posizionamento media
      messageRef.current.classList.remove("media-position", "video-position", "image-position");
    }
  }, [messagePosition, modalOpen, activeMedia]);

  return (
    <>
      {/* Icona 1 */}
      <button
        className={`geo-icon${paused ? " geo-icon--paused" : ""}`}
        aria-label="Apri video geolocalizzazione"
        style={{ top: "26%", left: "26%" }}
        onClick={(e) => openModal("video", "/video.mp4", "Colombia, Sud America", null, e)}
        disabled={paused}
      >
        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
          <path
            fill="currentColor"
            d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z"
          />
        </svg>
      </button>

      {/* Icona 2 */}
      <button
        className={`geo-icon${paused ? " geo-icon--paused" : ""}`}
        aria-label="Apri video geolocalizzazione 2"
        style={{ top: "17%", left: "15%" }}
        onClick={(e) => openModal("image", "/lacucina.jpeg", "Head Quarter", "3000", e)}
        disabled={paused}
      >
        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
          <path
            fill="currentColor"
            d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z"
          />
        </svg>
      </button>

      {/* Il modal e il messaggio devono essere a livello globale per essere sempre visibili */}
      <div id="geoPortal">
        {/* Messaggio temporaneo */}
        <div id="geoMessage" className="geo-message" ref={messageRef}></div>

        {/* Modal con video/immagine */}
        <div
          className={`video-modal ${modalOpen ? "open" : ""}`}
          ref={modalRef}
          onClick={handleModalClick}
          aria-hidden={!modalOpen}
        >
          <div
            className="video-content"
            role="dialog"
            aria-modal="true"
            aria-label="Preview geolocalizzazione"
            ref={contentRef}
          >
            <video
              className="geo-media"
              autoPlay
              muted
              playsInline
              webkit-playsinline="true"
              preload="auto"
              style={{
                display: activeMedia.type === "video" ? "block" : "none",
              }}
              ref={videoRef}
              onLoadStart={(e) => {
                // Tentiamo di avviare la riproduzione appena il video inizia a caricare
                e.target
                  .play()
                  .catch(() => {/* Ignoriamo l'errore qui, ci riproveremo più tardi */});
              }}
              onCanPlay={(e) => {
                // Forza l'avvio della riproduzione appena il video può essere riprodotto
                e.target
                  .play()
                  .catch((err) => console.warn("Autoplay fallito:", err));
              }}
              onEnded={() => {
                // Chiude automaticamente il modal quando il video finisce
                closeModal();
              }}
            >
              {activeMedia.src && activeMedia.type === "video" && (
                <source src={activeMedia.src} type="video/mp4" />
              )}
            </video>
            <img
              className="geo-media"
              src={activeMedia.type === "image" ? activeMedia.src : null}
              alt={activeMedia.message || ""}
              style={{
                display: activeMedia.type === "image" ? "block" : "none",
              }}
              ref={imgRef}
            />
          </div>
        </div>
      </div>
    </>
  );
}
