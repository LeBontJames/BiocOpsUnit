
"use client";

import { useEffect, useRef } from 'react';
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass";

export default function BigBangAnimation({ onComplete }) {
  const containerRef = useRef(null);
  const initialized = useRef(false);

  // Funzione che inizializza l'animazione Three.js
  const initAnimation = () => {
    if (initialized.current || !containerRef.current) return null;
    initialized.current = true;

    // Variabili globali per la scena, camera, renderer, controlli e oggetti della simulazione
    let scene, camera, renderer, controls, composer;
    let particleSystem, particlePositions, particleVelocities;
    let galaxySystem = null; // Conterrà il cluster galattico (aggiunto dopo)
    let nebula = null; // Conterrà lo sfondo nebuloso (aggiunto dopo)
    let particleCount = 15000; // Numero di particelle per l'esplosione del Big Bang
    let params; // Oggetto per memorizzare i parametri controllati dall'UI
    let clock = new THREE.Clock(); // Orologio per tenere traccia del tempo trascorso
    let animationFrameId; // Per gestire l'animazione

    // Funzione: init()
    // Configura la scena, camera, renderer, luci, sistema di particelle, post-processing, ecc.
    function init() {
      // Creiamo una nuova scena
      scene = new THREE.Scene();

      // Creiamo una camera prospettica
      camera = new THREE.PerspectiveCamera(
        60,
        window.innerWidth / window.innerHeight,
        0.1,
        10000
      );
      // Posizioniamo la camera molto più a sinistra per un movimento ancora più evidente
      camera.position.set(-50, 0, 200);

      // Creiamo il renderer WebGL con antialiasing e impostiamo la sua dimensione
      renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.shadowMap.enabled = true; // Abilitiamo le shadow maps per maggior realismo
      containerRef.current.appendChild(renderer.domElement);

      // Aggiungiamo OrbitControls per permettere all'utente di esplorare la scena
  controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true; // Movimento camera più fluido
      controls.dampingFactor = 0.05;
      // Manteniamo i controlli attivi per consentire all'utente di esplorare la scena

      // Aggiungiamo luce ambientale per illuminare leggermente la scena
      const ambientLight = new THREE.AmbientLight(0x404040, 1.5);
      scene.add(ambientLight);

      // Aggiungiamo una luce puntuale all'origine per simulare l'intensa energia del Big Bang
      const pointLight = new THREE.PointLight(0xffffff, 2, 1000);
      pointLight.position.set(0, 0, 0);
      pointLight.castShadow = true;
      scene.add(pointLight);

      // Configuriamo il post-processing usando EffectComposer e aggiungiamo un bloom pass per simulare luce volumetrica
      composer = new EffectComposer(renderer);
      let renderPass = new RenderPass(scene, camera);
      composer.addPass(renderPass);
      let bloomPass = new UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        1.5, // intensità
        0.4, // raggio
        0.85 // soglia
      );
      bloomPass.threshold = 0;
      bloomPass.strength = 2;
      bloomPass.radius = 0.5;
      composer.addPass(bloomPass);

      // Creiamo il sistema di particelle principale che rappresenta l'esplosione iniziale del Big Bang
      createParticleSystem();

      // Configuriamo i parametri di default
      params = {
        expansionSpeed: 50, // Velocità di espansione delle particelle
        particleSize: 1.5, // Dimensione delle particelle
        bloomStrength: 2, // Intensità dell'effetto bloom
        bloomRadius: 0.5, // Raggio dell'effetto bloom
        bloomThreshold: 0, // Soglia dell'effetto bloom
      };

      // Aggiungiamo listener per il ridimensionamento della finestra
      window.addEventListener("resize", onWindowResize, false);
    }

    // Funzione: createParticleSystem()
    // Crea un sistema di particelle dove tutte le particelle hanno origine nella singolarità
    // e vengono assegnate velocità casuali che le faranno espandere verso l'esterno
    function createParticleSystem() {
      // Creiamo una BufferGeometry per memorizzare le posizioni delle particelle
      const geometry = new THREE.BufferGeometry();

      // Allochiamo array per le posizioni e le velocità delle particelle
      particlePositions = new Float32Array(particleCount * 3);
      particleVelocities = new Float32Array(particleCount * 3);

      // Inizializziamo ogni particella a (0,0,0) con una velocità casuale verso l'esterno
      for (let i = 0; i < particleCount; i++) {
        // Tutte le particelle iniziano nella singolarità (con un piccolo offset se desiderato)
        particlePositions[i * 3] = 0;
        particlePositions[i * 3 + 1] = 0;
        particlePositions[i * 3 + 2] = 0;

        // Determiniamo casualmente la direzione della particella (coordinate sferiche)
        let theta = Math.random() * 2 * Math.PI;
        let phi = Math.acos(Math.random() * 2 - 1);
        let speed = Math.random() * 0.5 + 0.5; // Velocità tra 0.5 e 1.0
        particleVelocities[i * 3] = speed * Math.sin(phi) * Math.cos(theta);
        particleVelocities[i * 3 + 1] = speed * Math.sin(phi) * Math.sin(theta);
        particleVelocities[i * 3 + 2] = speed * Math.cos(phi);
      }

      // Colleghiamo le posizioni alla geometria
      geometry.setAttribute(
        "position",
        new THREE.BufferAttribute(particlePositions, 3)
      );

      // Creiamo un PointsMaterial usando una texture sprite personalizzata per un bagliore morbido
      const sprite = generateSprite();
      const material = new THREE.PointsMaterial({
        size: 2,
        map: sprite,
        blending: THREE.AdditiveBlending,
        depthTest: false,
        transparent: true,
        opacity: 0.8,
        color: 0xffffff,
      });

      // Creiamo il sistema di particelle e lo aggiungiamo alla scena
      particleSystem = new THREE.Points(geometry, material);
      scene.add(particleSystem);
    }

    // Funzione: generateSprite()
    // Genera una texture sprite circolare e luminosa utilizzando l'elemento canvas
    function generateSprite() {
      const canvas = document.createElement("canvas");
      canvas.width = 64;
      canvas.height = 64;
      const context = canvas.getContext("2d");

      // Creiamo un gradiente radiale per il bagliore
      const gradient = context.createRadialGradient(32, 32, 0, 32, 32, 32);
      gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
      gradient.addColorStop(0.2, "rgba(255, 200, 200, 0.8)");
      gradient.addColorStop(0.4, "rgba(200, 100, 100, 0.6)");
      gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
      context.fillStyle = gradient;
      context.fillRect(0, 0, 64, 64);

      // Creiamo e restituiamo una texture dal canvas
      const texture = new THREE.CanvasTexture(canvas);
      return texture;
    }

    // Funzione: onWindowResize()
    // Adatta il rapporto d'aspetto della camera e la dimensione del renderer quando la finestra del browser viene ridimensionata
    function onWindowResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      composer.setSize(window.innerWidth, window.innerHeight);
    }

    // Funzione: animate()
    // Il loop principale di animazione: aggiorna le posizioni delle particelle e renderizza la scena
    function animate() {
      animationFrameId = requestAnimationFrame(animate);

      // Calcoliamo il tempo trascorso dall'ultimo frame
      const delta = clock.getDelta();

      // Aggiorniamo le posizioni delle particelle dell'esplosione
      updateParticles(delta);

      // Verifichiamo solo il tempo per completare l'animazione
      let elapsed = clock.elapsedTime;
      
      // Calcoliamo il fattore di velocità basato sul tempo trascorso
      let speedFactor = elapsed <= 2 ? 1 : Math.max(0.5, 1 - (elapsed - 2) * 0.25);
      
      // Movimento della camera con velocità variabile
      camera.position.x += 60 * delta * speedFactor; // Velocità iniziale doppia che poi diminuisce
      camera.position.y += 6 * delta * speedFactor; // Anche il movimento verticale segue la stessa curva di velocità
      
      // Segnaliamo il completamento dopo 4 secondi ma manteniamo l'ultimo frame
      if (elapsed > 4 && onComplete) {
        // Invece di fare un cleanup completo, fermiamo solo l'animazione
        pauseAnimation();
        onComplete();
      }

      // Aggiorniamo i controlli della camera
      controls.update();

      // Renderizziamo la scena utilizzando il composer di post-processing (che include il bloom)
      composer.render(delta);
    }

    // Funzione: updateParticles()
    // Sposta ogni particella verso l'esterno dal centro aggiornando la sua posizione in base
    // alla sua velocità e alla velocità di espansione controllata dall'utente
    function updateParticles(delta) {
      const positions = particleSystem.geometry.attributes.position.array;
      for (let i = 0; i < particleCount; i++) {
        let index = i * 3;
        positions[index] += particleVelocities[index] * params.expansionSpeed * delta;
        positions[index + 1] += particleVelocities[index + 1] * params.expansionSpeed * delta;
        positions[index + 2] += particleVelocities[index + 2] * params.expansionSpeed * delta;
      }
      particleSystem.geometry.attributes.position.needsUpdate = true;
    }

    // Funzione: createGalaxyCluster()
    // Crea un sistema di particelle secondario per simulare l'apparizione di galassie e
    // ammassi stellari nell'universo successivo
    function createGalaxyCluster() {
      const galaxyCount = 5000; // Numero di particelle galattiche
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(galaxyCount * 3);

      // Distribuiamo casualmente le particelle galattiche in una grande regione sferica
      for (let i = 0; i < galaxyCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 1000;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 1000;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 1000;
      }
      geometry.setAttribute(
        "position",
        new THREE.BufferAttribute(positions, 3)
      );

      // Creiamo un PointsMaterial per il cluster galattico con punti più piccoli e più tenui
      const material = new THREE.PointsMaterial({
        size: 1.5,
        color: 0xaaaaaa,
        blending: THREE.AdditiveBlending,
        transparent: true,
        opacity: 0.5,
        depthTest: false,
      });

      // Creiamo il sistema di particelle galattiche e lo aggiungiamo alla scena
      galaxySystem = new THREE.Points(geometry, material);
      scene.add(galaxySystem);
    }

    // Funzione per fermare l'animazione ma mantenere l'ultimo frame visibile
    function pauseAnimation() {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      
      // Manteniamo i controlli attivi per permettere all'utente di esplorare la scena finale
      
      // Renderizza un ultimo frame per assicurare che l'ultimo stato sia visualizzato
      if (composer) {
        composer.render();
      }
    }

    // Cleanup function to prevent memory leaks
    function cleanup() {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      
      window.removeEventListener("resize", onWindowResize);
      
      // Remove all objects from the scene
      if (particleSystem && scene) scene.remove(particleSystem);
      if (galaxySystem && scene) scene.remove(galaxySystem);
      if (nebula && scene) scene.remove(nebula);
      
      // Dispose geometries and materials
      if (particleSystem) {
        if (particleSystem.geometry) particleSystem.geometry.dispose();
        if (particleSystem.material) particleSystem.material.dispose();
      }
      
      if (galaxySystem) {
        if (galaxySystem.geometry) galaxySystem.geometry.dispose();
        if (galaxySystem.material) galaxySystem.material.dispose();
      }
      
      if (nebula) {
        if (nebula.geometry) nebula.geometry.dispose();
        if (nebula.material) nebula.material.dispose();
      }
      
      // Dispose renderer - composer non ha un metodo dispose in questa versione di Three.js
      if (renderer) renderer.dispose();
      
      // Rimuovi gli elementi DOM se presenti
      if (renderer && renderer.domElement && containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
      
      // Clear references
      scene = null;
      camera = null;
      renderer = null;
      controls = null;
      composer = null;
      particleSystem = null;
      particlePositions = null;
      particleVelocities = null;
      galaxySystem = null;
      nebula = null;
    }

    // Inizializziamo la scena e avviamo il loop di animazione
    init();
    animate();

    // Restituiamo la funzione di cleanup per essere usata quando il componente viene smontato
    return cleanup;
  };

  useEffect(() => {
    let cleanupFn = null;
    // Inizializza direttamente l'animazione
    const cleanupRef = initAnimation();
    if (typeof cleanupRef === 'function') {
      cleanupFn = cleanupRef;
    }
    // Cleanup solo quando il componente viene smontato
    return () => {
      if (cleanupFn) {
        cleanupFn();
      }
    };
  }, []);

  return (
    <div ref={containerRef} style={{ 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      width: '100%', 
      height: '100%',
      background: 'black', 
      zIndex: 9990 
    }} />
  );
}
