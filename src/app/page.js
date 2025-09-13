"use client";
import Navbar from "./components/Navbar";
import GalaxyModal from "./components/GalaxyModal";
import SplashScreen from "./components/SplashScreen";
import ScrollContainer from "./components/ScrollContainer";
import DiscoverPanel from "./components/DiscoverPanel";
import GeoIcons from "./components/GeoIcons";
import HomeVideo from "./components/HomeVideo";
import MobileBurgerMenu from "./components/MobileBurgerMenu";
import BlackHoleModal from "./components/BlackHoleModal";
import Image from "next/image";
import "./styles/starfield.css";
import "./styles/sections.css";
import "./styles/home.css";
import "./styles/side-tabs.css";
import "./styles/discover.css";
import "./styles/geo-icons.css";
import "./styles/mobile-burger.css";
import SpiralGalaxy from './components/SpiralGalaxy';

import { useState, useEffect } from "react";

export default function Home() {
  const [showNebula, setShowNebula] = useState(false);
  const [showGalaxy, setShowGalaxy] = useState(false);
  const [discoverOpen, setDiscoverOpen] = useState(false);
  const [geoModalOpen, setGeoModalOpen] = useState(false);

  useEffect(() => {
    // Attiva l'animazione galassia quando la splash è completata
    const checkSplash = () => {
      if (document?.documentElement?.classList.contains("splash-completed")) {
        setShowGalaxy(true);
      } else {
        setShowGalaxy(false);
      }
    };
    checkSplash();
    const observer = new MutationObserver(checkSplash);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <SplashScreen />
      {/* Bottoni laterali verticali */}
      <a href="#shop" className="side-tab side-tab--left">
        <span>SHOP</span>
      </a>
      <a href="#info" className="side-tab side-tab--right">
        <span>DISCOVER</span>
      </a>

      {/* Discover Panel con callback per stato apertura */}
      <DiscoverPanel onOpenChange={setDiscoverOpen} />

      {/* Navbar per desktop */}
      <Navbar />

      {/* Burger menu mobile solo per home section dopo la splash */}
      <MobileBurgerMenu hide={showNebula} />

      {/* Galaxy Modal (animazione Three.js) */}
      <GalaxyModal open={showNebula} onClose={() => setShowNebula(false)} />

      <ScrollContainer showGalaxy={showGalaxy}>
        {/* Logo spostato dentro ScrollContainer ma visivamente rimane fisso con CSS */}
        <div className="logo-wrapper">
          <Image
            src="/LogoBig/logobig.PNG"
            alt="Biocops Logo"
            width={800}
            height={800}
            priority
            className="home-logo"
            id="home-logo"
            onClick={() => {
              const homeSection = document.querySelector('.home-section');
              if (homeSection) {
                homeSection.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            style={{ cursor: 'pointer' }}
          />
        </div>
        {/* Video Sequenza 01 cliccabile per aprire l'animazione, ora fuori dal logo */}
            <div
              className="sequenza-video-wrapper"
              aria-label="Sequenza 01"
              style={{ position: "absolute", top: "20px", left: "10px" }} // esempio
            >
              <HomeVideo paused={discoverOpen} />
            </div>
        <section className="scroll-section home-section">
          <div className="h-screen w-screen relative">
            {/* Animazione galassia visibile solo dopo la splash screen e se DiscoverPanel o GeoModal NON sono aperti */}
            {showGalaxy && !discoverOpen && !geoModalOpen && (
              <div
                style={{position: "absolute", top: "32px", right: "32px", zIndex: 10000, cursor: "pointer"}}
                onClick={() => setShowNebula(true)}
                aria-label="Apri animazione galassia"
              >
                  <SpiralGalaxy width={90} height={90} particleCount={150} maxRadius={20} spiralArms={3} rotationSpeed={0.01} paused={showNebula || discoverOpen || geoModalOpen} />
              </div>
            )}
            {/* Geo Icons visibili solo nella home section */}
            <div className="geo-icons-container">
              <GeoIcons paused={discoverOpen} onModalChange={setGeoModalOpen} />
            </div>
            {/* Scroll indicator text */}
            <div className="scroll-indicator" data-paused={discoverOpen}>
              Scroll for the collection
            </div>
          </div>
        </section>
        
        
        <section className="scroll-section second-section">
          <div className="h-screen w-screen relative">
            {/* Sfondo alieno stiloso nell'universo */}
            <div style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              zIndex: 1,
              overflow: "hidden"
            }}>
              <img
                src="/Alien%20stiloso%20nell'Universo.png"
                alt="Alieno stiloso nell'universo"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  opacity: 1,
                  marginTop: "0px"
                }}
              />
            </div>
            <div className="scroll-indicator">
              Tap for all logos
            </div>
          </div>
        </section>
        <section className="scroll-section third-section">
          {/* Sfondo alieno stiloso nell'universo (terza sezione identica) */}
          <div style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            zIndex: 1,
            overflow: "hidden"
          }}>
            <img
              src="/Scimmia_cecchino_nelle_stelle.png"
              alt="Scimmia cecchino tra le stelle"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                opacity: 1,
                marginTop: "0px"
              }}
            />
          </div>
          <div className="scroll-indicator">
            TAP FOR BIOC OPS UNIT
          </div>
        </section>
        <section className="scroll-section fourth-section">
          {/* Sfondo scimmie 2.png (quarta sezione identica) */}
          <div style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            zIndex: 1,
            overflow: "hidden"
          }}>
            <img
              src="/scimmie%202.png"
              alt="Scimmie 2"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                opacity: 1,
                marginTop: "0px"
              }}
            />
          </div>
          <div className="scroll-indicator">
            TAP FOR BIOC MEMBERS
          </div>
        </section>

        <section className="scroll-section fifth-section">
          {/* Sfondo tatuatrice nello spazio cosmico (quinta sezione) */}
          <div style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            zIndex: 1,
            overflow: "hidden"
          }}>
            <img
              src="/Scimmia tatuatrice nello spazio cosmico.png"
              alt="Tatuatrice nello spazio cosmico"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                opacity: 1,
                marginTop: "0px"
              }}
            />
          </div>
          <div className="scroll-indicator">
            TAP FOR BIOC COLLAB
          </div>
        </section>
        <section className="scroll-section sixth-section">
          {/* Sfondo identico alla quinta sezione */}
          <div style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            zIndex: 1,
            overflow: "hidden"
          }}>
            <img
              src="/Scimmia gang.png"
              alt="Tatuatrice nello spazio cosmico"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                opacity: 1,
                marginTop: "-10px"
              }}
            />
          </div>
          <div className="scroll-indicator">
            TAP FOR MORE BIOC INFO
          </div>
        </section>
      </ScrollContainer>
    </>
  );
}
