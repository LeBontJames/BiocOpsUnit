"use client";

import { useState, useRef, useEffect } from "react";

export default function DiscoverPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const videoRef = useRef(null);
  const panelRef = useRef(null);
  const overlayRef = useRef(null);
  const lastFocusedRef = useRef(null);

  // Handle opening and closing the panel
  useEffect(() => {
    const openBtn = document.querySelector(".side-tab--right");
    const closeBtn = document.getElementById("discoverClose");

    const handleOpen = (e) => {
      e.preventDefault();
      setIsOpen(true);
    };

    const handleClose = () => {
      setIsOpen(false);
    };

    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    // Add event listeners
    if (openBtn) openBtn.addEventListener("click", handleOpen);
    if (closeBtn) closeBtn.addEventListener("click", handleClose);
    if (overlayRef.current)
      overlayRef.current.addEventListener("click", handleClose);
    document.addEventListener("keydown", handleKeyDown);

    // Clean up event listeners
    return () => {
      if (openBtn) openBtn.removeEventListener("click", handleOpen);
      if (closeBtn) closeBtn.removeEventListener("click", handleClose);
      if (overlayRef.current)
        overlayRef.current.removeEventListener("click", handleClose);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  // Preload del video quando il componente viene montato
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.preload = "auto"; // Precarica il video completamente
      // Inizia a bufferizzare il video anche se non è visibile
      videoRef.current.load();
    }
  }, []);

  // Handle video playback and skip functionality
  useEffect(() => {
    const video = videoRef.current;
    const skipBtn = document.getElementById("discoverSkip");

    if (!video || !skipBtn) return;

    const handleSkip = () => {
      try {
        video.playbackRate = 8.0;
        video.play().catch(() => {});
        skipBtn.style.display = "none";
      } catch (e) {
        console.warn("PlaybackRate not supported:", e);
      }
    };

    const handleVideoEnd = () => {
      skipBtn.style.display = "none";
    };

    const handleVideoPlay = () => {
      if (video.playbackRate === 1.0) {
        skipBtn.style.display = "block";
      }
    };

    skipBtn.addEventListener("click", handleSkip);
    video.addEventListener("ended", handleVideoEnd);
    video.addEventListener("play", handleVideoPlay);

    return () => {
      skipBtn.removeEventListener("click", handleSkip);
      video.removeEventListener("ended", handleVideoEnd);
      video.removeEventListener("play", handleVideoPlay);
    };
  }, [isOpen]);

  // Manage panel state and body class
  useEffect(() => {
    const panel = panelRef.current;
    const overlay = overlayRef.current;
    const video = videoRef.current;

    if (!panel || !overlay || !video) return;

    panel.setAttribute("aria-hidden", String(!isOpen));
    overlay.setAttribute("aria-hidden", String(!isOpen));
    document.body.classList.toggle("discover-open", isOpen);

    if (isOpen) {
      // Save last focused element
      lastFocusedRef.current = document.activeElement;

      // Set up video for opening
      const skipBtn = document.getElementById("discoverSkip");
      if (skipBtn) skipBtn.style.display = "block";
      video.playbackRate = 1.0;
      video.currentTime = 0;
      
      // Assicuriamoci che il video sia pronto prima di riprodurlo
      if (video.readyState >= 3) {
        video.play().catch(() => {});
      } else {
        video.addEventListener('canplay', () => {
          video.play().catch(() => {});
        }, { once: true });
      }

      // Focus on first focusable element
      const focusableSelector =
        'a,button,input,select,textarea,[tabindex]:not([tabindex="-1"])';
      const focusables = panel.querySelectorAll(focusableSelector);
      (focusables[0] || document.getElementById("discoverClose")).focus();
    } else if (lastFocusedRef.current) {
      // Return focus to last element when closing
      lastFocusedRef.current.focus();

      // Pause video when closing
      video.pause();
      video.playbackRate = 1.0;
    }
  }, [isOpen]);

  return (
    <>
      <div
        className="discover-overlay"
        id="discoverOverlay"
        aria-hidden="true"
        ref={overlayRef}
      ></div>

      <aside
        className="discover-panel"
        id="discoverPanel"
        aria-hidden="true"
        role="dialog"
        aria-label="Discover"
        ref={panelRef}
      >
        <button
          className="discover-close"
          id="discoverClose"
          aria-label="Chiudi Discover"
        >
          ✕
        </button>
        <button
          className="discover-skip"
          id="discoverSkip"
          aria-label="Salta/velocizza video a 3x"
        >
          Skip
        </button>

        <div className="discover-scroll">
          <section className="discover-section discover-hero">
            <video
              id="discoverVideo"
              className="discover-video"
              autoPlay
              muted
              playsInline
              preload="auto"
              ref={videoRef}
              loading="eager"
              disablePictureInPicture
              disableRemotePlayback
              x-webkit-airplay="deny"
            >
              <source src="/VideoDiscover.mp4" type="video/mp4" />
              {/* Fornisci un poster per il caricamento iniziale */}
              <img src="/BackM.png" alt="Video thumbnail" />
            </video>
            <div className="video-text">Powered by NASA</div>
            <div className="discover-hero-content">{/* Content here */}</div>
          </section>

          <section className="discover-section discover-more">
            <div className="container">{/* Additional content here */}</div>
          </section>
        </div>
      </aside>
    </>
  );
}
