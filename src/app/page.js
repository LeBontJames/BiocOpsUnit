"use client";
import Navbar from "./components/Navbar";
import GalaxyModal from "./components/GalaxyModal";
import SplashScreen from "./components/SplashScreen";
import ScrollContainer from "./components/ScrollContainer";
import DiscoverPanel from "./components/DiscoverPanel";
import GeoIcons from "./components/GeoIcons";
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

import { useState } from "react";

export default function Home() {
  const [showNebula, setShowNebula] = useState(false);
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

      {/* Discover Panel */}
      <DiscoverPanel />


  {/* Navbar per desktop */}
  <Navbar />

  {/* Burger menu mobile solo per home section dopo la splash */}
  <MobileBurgerMenu hide={showNebula} />

  {/* Galaxy Modal (animazione Three.js) */}
  <GalaxyModal open={showNebula} onClose={() => setShowNebula(false)} />

      <ScrollContainer>
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
              />
            </div>
            {/* Video Sequenza 01 cliccabile per aprire l'animazione, ora fuori dal logo */}
            <div
              className="sequenza-video-wrapper"
              aria-label="Apri Sequenza 01"
            >
              <video
                src="/Sequenza 01.mp4"
                width={60}
                height={34}
                style={{ display: "block", width: "60px", height: "34px", objectFit: "cover", opacity: 0.7, cursor: "pointer", transform: "rotate(-20deg)" }}
                autoPlay
                loop
                muted
                playsInline
                onClick={() => setShowNebula(true)}
              />
            </div>
        <section className="scroll-section home-section">
          <div className="h-screen w-screen relative">
            {/* Geo Icons visibili solo nella home section */}
            <div className="geo-icons-container">
              <GeoIcons />
            </div>
            {/* Scroll indicator text */}
            <div className="scroll-indicator">
              Scroll for the collection
            </div>
          </div>
        </section>
        
        <section className="scroll-section second-section">
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
        </section>
      </ScrollContainer>
    </>
  );
}
