// Dati fittizi

const risultatiRecenti = [
  {
    torneo: "Warzone World Cup",
    vincitore: "Team Hydra",
    data: "20 Agosto 2025",
  },
  {
    torneo: "Clash of Verdansk",
    vincitore: "Squad Alpha",
    data: "15 Agosto 2025",
  },
];

const prossimiEventi = [
  { torneo: "Battle Royale Masters", data: "25 Agosto 2025" },
  { torneo: "Verdansk Showdown", data: "28 Agosto 2025" },
];

const torneiInArrivo = [
  { nome: "Warzone Elite Cup", data: "30 Agosto 2025" },
  { nome: "Modern Warfare League", data: "5 Settembre 2025" },
  { nome: "ClutchPoint Invitational", data: "10 Settembre 2025" },
];

document.body.style.overflow = "hidden"; // Blocca scroll splash all'avvio
// Apertura menu hamburger su mobile
const hamburger = document.querySelector(".hamburger");
const nav = document.querySelector(".nav-links");

hamburger.addEventListener("click", () => {
  nav.classList.toggle("nav-active");
});

// ✨ Dissolvenza dolce dopo il "caricamento" della barra
const splash = document.querySelector(".splash-screen");
const progressBar = document.querySelector(".splash-progress__bar");

// ====== FASE 1 (Three.js) → dopo 7s → FASE 2; teardown alla CHIUSURA splash ======
(function () {
  const splash = document.querySelector(".splash-screen");
  const phase2 = document.getElementById("splashPhase2");
  const mount = document.getElementById("threeMount");
  const progressBar = document.querySelector(".splash-progress__bar"); // barra vecchia

  if (!splash || !phase2 || !mount || !window.THREE) return;

  // --- Variabili Three (serve il teardown al momento giusto) ---
  let scene, camera, renderer, controls, composer, clock;
  let particleSystem, particlePositions, particleVelocities;
  let galaxySystem = null,
    nebula = null;
  const particleCount = 20000;
  let params;
  // --- Timing & speedup for Phase 1 ---
  const PHASE1_DURATION = 3000; // ms (era 7000)
  const PHASE1_SPEEDUP = 7000 / PHASE1_DURATION; // ~1.4x: stessa animazione in meno tempo
  let phase2Started = false;
  let vtime = 0; // tempo virtuale accelerato per i trigger (galassie/nebulosa)

  // Avvia **subito** la fase 1 (Three.js)
  initThree();
  animateThree();

  // Dopo 7s: fai partire la fase 2 (vecchia splash sopra) — ma NON spegnere Three
  setTimeout(() => {
    splash.classList.add("phase2"); // ora PNG, stelle e barra sono sopra
    phase2Started = true;
    pauseThree(); // ⬅️ blocca il loop: il canvas resta con l’ultimo frame
  }, PHASE1_DURATION);

  // ⬇️ Quando la barra finisce, il tuo codice applica is-fading e dopo ~1s nasconde la splash
  //    Qui ci agganciamo per fare teardown della scena Three in sincrono con la chiusura.
  if (progressBar) {
    progressBar.addEventListener("animationend", (e) => {
      if (e.animationName !== "splashLoading") return;
      // il tuo script aspetta ~1000ms di fade e poi mette display:none
      setTimeout(() => {
        teardownThree();
      }, 1020); // leggermente oltre 1s per sicurezza
    });
  }

  // ======= Three.js setup (identico a prima, montato nel DIV) =======
  function initThree() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(
      60,
      mount.clientWidth / mount.clientHeight,
      0.1,
      10000
    );
    // Sposta la camera più a destra all'inizio
    camera.position.set(0, 0, 200); // era (0, 0, 200)

    renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false, // canvas opaco
      preserveDrawingBuffer: true, // conserva l’ultimo frame
    });
    renderer.setClearColor(0x000000, 1); // sfondo nero pieno
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    mount.appendChild(renderer.domElement);

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    scene.add(new THREE.AmbientLight(0x404040, 1.5));
    const pointLight = new THREE.PointLight(0xffffff, 2, 1000);
    pointLight.position.set(0, 0, 0);
    pointLight.castShadow = true;
    scene.add(pointLight);

    composer = new THREE.EffectComposer(renderer);
    const renderPass = new THREE.RenderPass(scene, camera);
    composer.addPass(renderPass);
    const bloomPass = new THREE.UnrealBloomPass(
      new THREE.Vector2(mount.clientWidth, mount.clientHeight),
      2,
      0.5,
      0
    );
    composer.addPass(bloomPass);

    createParticleSystem();
    setupGUI();

    clock = new THREE.Clock();
    window.addEventListener("resize", onResize, { passive: true });
  }

  function onResize() {
    if (!renderer) return;
    const { clientWidth: w, clientHeight: h } = mount;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
    if (composer) composer.setSize(w, h);
  }

  function createParticleSystem() {
    const geometry = new THREE.BufferGeometry();
    particlePositions = new Float32Array(particleCount * 3);
    particleVelocities = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = 0;
      particlePositions[i * 3 + 1] = 0;
      particlePositions[i * 3 + 2] = 0;
      const theta = Math.random() * 2 * Math.PI;
      const phi = Math.acos(Math.random() * 2 - 1);
      const speed = Math.random() * 0.5 + 0.5;
      particleVelocities[i * 3] = speed * Math.sin(phi) * Math.cos(theta);
      particleVelocities[i * 3 + 1] = speed * Math.sin(phi) * Math.sin(theta);
      particleVelocities[i * 3 + 2] = speed * Math.cos(phi);
    }
    geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(particlePositions, 3)
    );
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
    particleSystem = new THREE.Points(geometry, material);
    scene.add(particleSystem);
  }

  function generateSprite() {
    const canvas = document.createElement("canvas");
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext("2d");
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, "rgba(255,255,255,1)");
    grad.addColorStop(0.2, "rgba(255,200,200,0.8)");
    grad.addColorStop(0.4, "rgba(200,100,100,0.6)");
    grad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(canvas);
  }

  function setupGUI() {
    params = {
      expansionSpeed: 50,
      particleSize: 2,
      bloomStrength: 2,
      bloomRadius: 0.5,
      bloomThreshold: 0,
    };
    const gui = new dat.GUI({ width: 300 });
    gui.add(params, "expansionSpeed", 10, 200).name("Expansion Speed");
    gui
      .add(params, "particleSize", 1, 10)
      .name("Particle Size")
      .onChange((v) => {
        if (particleSystem) particleSystem.material.size = v;
      });
    gui
      .add(params, "bloomStrength", 0, 5)
      .name("Bloom Strength")
      .onChange((v) => {
        if (composer && composer.passes[1]) composer.passes[1].strength = v;
      });
    gui
      .add(params, "bloomRadius", 0, 1)
      .name("Bloom Radius")
      .onChange((v) => {
        if (composer && composer.passes[1]) composer.passes[1].radius = v;
      });
    gui
      .add(params, "bloomThreshold", 0, 1)
      .name("Bloom Threshold")
      .onChange((v) => {
        if (composer && composer.passes[1]) composer.passes[1].threshold = v;
      });
  }

  function animateThree() {
    const loop = () => {
      // 👇 Salva SEMPRE l'ID dell'ultimo frame pianificato
      animateThree._raf = requestAnimationFrame(loop);

      const rawDelta = clock.getDelta();
      const speed = phase2Started ? 1 : PHASE1_SPEEDUP;
      const delta = rawDelta * speed;
      vtime += delta;

      // Movimento camera orizzontale solo durante fase 1
      if (!phase2Started) {
        // Velocità movimento camera (regola questo valore per più veloce/lento)
        const cameraSpeed = 15;
        camera.position.x -= cameraSpeed * delta;
      }

      updateParticles(delta);
      if (vtime > 10 && !galaxySystem) createGalaxyCluster();
      if (vtime > 15 && !nebula) createNebula();

      controls.update();
      composer.render(delta);
    };
    loop();
  }

  function updateParticles(delta) {
    const pos = particleSystem.geometry.attributes.position.array;
    for (let i = 0; i < particleCount; i++) {
      const idx = i * 3;
      pos[idx] += particleVelocities[idx] * params.expansionSpeed * delta;
      pos[idx + 1] +=
        particleVelocities[idx + 1] * params.expansionSpeed * delta;
      pos[idx + 2] +=
        particleVelocities[idx + 2] * params.expansionSpeed * delta;
    }
    particleSystem.geometry.attributes.position.needsUpdate = true;
  }

  function createGalaxyCluster() {
    const galaxyCount = 5000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(galaxyCount * 3);
    for (let i = 0; i < galaxyCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 1000;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 1000;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 1000;
    }
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({
      size: 1.5,
      color: 0xaaaaaa,
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: 0.5,
      depthTest: false,
    });
    galaxySystem = new THREE.Points(geometry, material);
    scene.add(galaxySystem);
  }

  function createNebula() {
    const nebulaGeometry = new THREE.SphereGeometry(500, 32, 32);
    const nebulaMaterial = new THREE.MeshBasicMaterial({
      map: generateNebulaTexture(),
      side: THREE.BackSide,
      transparent: true,
      opacity: 0.7,
    });
    nebula = new THREE.Mesh(nebulaGeometry, nebulaMaterial);
    scene.add(nebula);
  }

  function generateNebulaTexture() {
    const size = 512;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    const grad = ctx.createRadialGradient(
      size / 2,
      size / 2,
      size / 8,
      size / 2,
      size / 2,
      size / 2
    );
    grad.addColorStop(0, "rgba(50,0,100,0.8)");
    grad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);
    for (let i = 0; i < 1000; i++) {
      ctx.fillStyle = "rgba(255,255,255," + Math.random() * 0.1 + ")";
      ctx.fillRect(Math.random() * size, Math.random() * size, 1, 1);
    }
    return new THREE.CanvasTexture(canvas);
  }

  function teardownThree() {
    if (animateThree._raf) cancelAnimationFrame(animateThree._raf);
    if (renderer && renderer.domElement) {
      renderer.domElement.style.transition = "opacity 300ms ease";
      renderer.domElement.style.opacity = "0.0";
      setTimeout(() => {
        try {
          mount.removeChild(renderer.domElement);
        } catch (e) {}
        if (controls) controls.dispose();
        disposeObject(scene);
        if (composer) {
          composer.renderTarget1 &&
            composer.renderTarget1.dispose &&
            composer.renderTarget1.dispose();
          composer.renderTarget2 &&
            composer.renderTarget2.dispose &&
            composer.renderTarget2.dispose();
        }
        if (renderer) {
          renderer.dispose();
          renderer.forceContextLoss && renderer.forceContextLoss();
        }
        scene = camera = renderer = controls = composer = null;
      }, 320);
    }
  }

  // 🔥 NUOVA FUNZIONE: ferma il loop senza rilasciare risorse
  function pauseThree() {
    if (animateThree._raf) {
      cancelAnimationFrame(animateThree._raf);
      animateThree._raf = null;
    }
    if (controls) controls.enabled = false; // disabilita input
    // Lasciamo il canvas così com'è
  }

  function disposeObject(obj) {
    if (!obj) return;
    obj.traverse((child) => {
      if (child.geometry) child.geometry.dispose && child.geometry.dispose();
      if (child.material) {
        if (Array.isArray(child.material))
          child.material.forEach((m) => disposeMaterial(m));
        else disposeMaterial(child.material);
      }
    });
  }
  function disposeMaterial(m) {
    m.dispose && m.dispose();
    for (const k in m) {
      const v = m[k];
      if (v && typeof v === "object" && "minFilter" in v && v.dispose)
        v.dispose();
    }
  }
})();

// quando la barra (keyframes: splashLoading) arriva al 100%
if (progressBar && splash) {
  progressBar.addEventListener("animationend", (e) => {
    if (e.animationName !== "splashLoading") return; // sicurezza

    // attiva la dissolvenza di 1 secondo
    splash.classList.add("is-fading");

    // dopo 1s (transizione finita) rimuovi la splash e riattiva lo scroll
    setTimeout(() => {
      splash.style.display = "none";
      document.body.style.overflow = "";
    }, 1000);
  });
}

// Render dinamico su tornei.html
if (document.getElementById("lista-tornei")) {
  const lista = document.getElementById("lista-tornei");
  torneiInArrivo.forEach((t) => {
    lista.innerHTML += `<p><strong>${t.nome}</strong> - Data: ${t.data}</p>`;
  });
}
// === ROTAZIONE HERO-LOGO SU MOBILE, A “SEGMENTI” DI SEZIONE ===
(function () {
  const mm = window.matchMedia("(max-width: 768px)");
  const logo = document.querySelector(".hero-logo");
  if (!logo) return;

  // Trova tutte le section (inclusa .hero). Ogni tratto [section[i] -> section[i+1]] = 1 giro (360°).
  let sections = Array.from(document.querySelectorAll("section"));
  if (sections.length < 2) return; // serve almeno hero + seconda

  // Precalcola le posizioni top dei segmenti
  let anchors = [];
  const recalc = () => {
    anchors = sections.map(
      (s) => s.getBoundingClientRect().top + window.scrollY
    );
    // Aggiungiamo anche un ancoraggio finale (fine dell’ultima section) così l’ultimo tratto ha una fine
    const last = sections[sections.length - 1];
    anchors.push(last.getBoundingClientRect().bottom + window.scrollY);
  };

  // Stato + rAF per performance
  let ticking = false;
  const onScroll = () => {
    if (!mm.matches) return; // solo mobile
    if (!ticking) {
      window.requestAnimationFrame(update);
      ticking = true;
    }
  };

  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

  const update = () => {
    ticking = false;

    const y = window.scrollY + 1;
    let i = anchors.findIndex(
      (a, idx) => y >= anchors[idx] && y < anchors[idx + 1]
    );
    if (i === -1) {
      if (y < anchors[0]) i = 0;
      else i = anchors.length - 2;
    }

    const start = anchors[i];
    const end = anchors[i + 1];
    const progress = clamp((y - start) / (end - start || 1), 0, 1);

    // Rotazione
    const baseRot = i * 360;
    const rot = baseRot + progress * 360;

    // 🔥 Scala solo su mobile
    let scale = 1;
    if (mm.matches) {
      if (i === 0) {
        // nel tratto hero → seconda section
        scale = 1 - 0.5 * progress; // da 1 → 0.5
      } else {
        // dalla seconda section in poi resta 0.5
        scale = 0.5;
      }
    }

    logo.style.transform = `translateX(-50%) rotate(${rot}deg) scale(${scale})`;
  };

  // Ricalcola su load/resize/content-change
  const onResize = () => {
    recalc();
    update();
  };

  // Solo quando lo schermo è mobile: abilita listeners
  const enable = () => {
    recalc();
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
  };

  const disable = () => {
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", onResize);
    logo.style.transform = "translateX(-50%)"; // niente rotazione su desktop
  };

  // Attiva/disattiva al cambiare breakpoint
  mm.addEventListener
    ? mm.addEventListener("change", (e) => (e.matches ? enable() : disable()))
    : mm.addListener((e) => (e.matches ? enable() : disable())); // compat

  // bootstrap
  if (mm.matches) enable();
})();

/* ================== */
/*<!--script stelle Hero--> */
/* ================== */

/* ===== STARFIELD SOLO NELLA HERO ===== */
(function () {
  const heroStarfield = document.getElementById("heroStarfield");
  if (!heroStarfield) return; // esci se non siamo in index o manca la hero

  // ✅ MODIFICA QUI: scegli tu le posizioni delle stelle
  const HERO_STARS = [
    { x: "3.4%", y: "6.99%", size: 5.8, duration: "2.9s", delay: "0.1s" },
    { x: "15.4%", y: "3.59%", size: 2.8, duration: "3.1s", delay: "0.1s" },
    { x: "92.4%", y: "12.59%", size: 6.8, duration: "1.9s", delay: "0.2s" },

    { x: "72.4%", y: "3.59%", size: 4.9, duration: "3.8s", delay: "0.25s" },
    { x: "95.4%", y: "32.59%", size: 5.9, duration: "2.5s", delay: "0.1s" },

    { x: "88.4%", y: "17.7%", size: 1.4, duration: "2.5s", delay: "0.48s" },

    { x: "12.4%", y: "52.59%", size: 2.1, duration: "3.2s", delay: "0.12s" },
    { x: "4.4%", y: "41.99%", size: 1, duration: "2.5s", delay: "0.2s" },
    { x: "18.4%", y: "48.99%", size: 1, duration: "2.1s", delay: "0.4s" },
    { x: "12.4%", y: "45.99%", size: 0.6, duration: "1.6s", delay: "0.3s" },

    { x: "98.5%", y: "2%", size: 0.6, duration: "3s", delay: "0.1s" },
  ];

  function pxOrRaw(v) {
    if (typeof v === "number") return v + "px";
    if (typeof v === "string" && /^\d+$/.test(v)) return v + "px";
    return String(v);
  }

  function createHeroStars(list) {
    heroStarfield.innerHTML = "";
    list.forEach((s) => {
      const el = document.createElement("div");
      el.className = "star";
      el.style.left = pxOrRaw(s.x);
      el.style.top = pxOrRaw(s.y);
      el.style.setProperty("--size", (s.size || 2) + "px");
      if (s.duration) el.style.setProperty("--dur", s.duration);
      if (s.delay) el.style.setProperty("--delay", s.delay);
      heroStarfield.appendChild(el);
    });
  }

  /* ===== SPLASH: clone dalla HERO + entrata dal centro + schedule fino a fine splash ===== */
  (() => {
    const splash = document.getElementById("splashStarfield");
    const hero = document.getElementById("heroStarfield");
    const screen = document.querySelector(".splash-screen");
    const bar = document.querySelector(".splash-progress__bar");
    if (!splash || !hero || !screen || !bar) return;

    // --- util ---
    const toSecsList = (val) =>
      String(val)
        .split(",")
        .map((s) => s.trim())
        .map((v) =>
          v.endsWith("ms") ? parseFloat(v) / 1000 : parseFloat(v) || 0
        );
    const first = (arr) => (arr && arr.length ? arr[0] : 0);
    const maxv = (arr) => arr.reduce((a, b) => Math.max(a, b), 0);

    // Timeline splash: delay + durata della barra + durata dissolvenza (transition)
    function getSplashTimeline() {
      const csBar = getComputedStyle(bar);
      const start = first(toSecsList(csBar.animationDelay)) || 0; // es. 1s
      const load = first(toSecsList(csBar.animationDuration)) || 0; // es. 5s
      const csSplash = getComputedStyle(screen);
      const fade = maxv(toSecsList(csSplash.transitionDuration)) || 0; // es. 1s (opacity/filter)
      return { start, load, fade, end: start + load + fade };
    }

    // Centro del ring (considera lo shift verso l’alto)
    function computeRingCenter() {
      const rect = splash.getBoundingClientRect();
      const upPx =
        parseFloat(
          getComputedStyle(screen).getPropertyValue("--splash-upshift")
        ) || 0;
      return {
        cx: rect.width * 0.5,
        cy: rect.height * 0.5 - upPx,
        w: rect.width,
        h: rect.height,
      };
    }

    // Vettori d’ingresso dal centro per ogni stella
    function setupSplashIntroVectors() {
      const { cx, cy, w, h } = computeRingCenter();
      const toPx = (val, total) =>
        String(val).trim().endsWith("%")
          ? (parseFloat(val) / 100) * total
          : parseFloat(val) || 0;

      splash.querySelectorAll(".star").forEach((star) => {
        const left = star.style.left || "0";
        const top = star.style.top || "0";
        const x = toPx(left, w);
        const y = toPx(top, h);
        const size = parseFloat(star.style.getPropertyValue("--size")) || 2;
        const starCx = x + size / 2;
        const starCy = y + size / 2;
        star.style.setProperty("--fromX", cx - starCx + "px");
        star.style.setProperty("--fromY", cy - starCy + "px");

        // direzione di uscita (centro -> stella)
        const dx = starCx - cx;
        const dy = starCy - cy;
        const ang = (Math.atan2(dy, dx) * 180) / Math.PI;
        star.style.setProperty("--introAngle", `${ang}deg`);

        // lunghezza massima della scia in base alla distanza (clamp 18–64px)
        const dist = Math.hypot(dx, dy);
        const trailMax = Math.max(18, Math.min(64, dist * 0.18));
        star.style.setProperty("--trailMax", `${trailMax.toFixed(1)}px`);
      });
    }

    // Distribuisce le nascite su tutta la durata della splash, in ordine mescolato
    function scheduleBirthsFullSpan() {
      const stars = Array.from(splash.querySelectorAll(".star"));
      if (!stars.length) return;

      const { start, end } = getSplashTimeline();
      const starInDur = 0.9; // deve combaciare con var(--starInDur) nel CSS
      const lastStart = Math.max(start, end - starInDur);

      // twinkle in fase con l’inizio del ring/caricamento
      splash.style.setProperty("--twinkleBase", `${start}s`);
      splash.style.setProperty("--starInDur", `${starInDur}s`);

      // mescola l’ordine spaziale
      for (let i = stars.length - 1; i > 0; i--) {
        const j = (Math.random() * (i + 1)) | 0;
        [stars[i], stars[j]] = [stars[j], stars[i]];
      }

      // tempi equidistanti + jitter, clampati al range [start, lastStart]
      const N = stars.length;
      const totalSpan = Math.max(0, lastStart - start);
      const baseGap = N > 1 ? totalSpan / (N - 1) : 0;
      const jitter = baseGap * 0.3;

      for (let k = 0; k < N; k++) {
        let t = start + k * baseGap + (Math.random() * 2 - 1) * jitter;
        if (t < start) t = start;
        if (t > lastStart) t = lastStart;
        stars[k].style.setProperty("--introDelayTotal", `${t}s`);
      }
    }

    // Clona dalla hero ⇒ vettori ⇒ schedule completo
    function copiaStelleDallaHero() {
      function setCrossRotations(container) {
        const stars = container.querySelectorAll(".star");
        stars.forEach((star, idx) => {
          // se è già impostato (o duplicato dalla hero), non toccare
          if (star.style.getPropertyValue("--cross-rot")) return;

          // angolo stabile: base pseudo-random deterministica + leggero jitter
          const base = (idx * 47) % 180; // 0..179
          const jitter = Math.random() * 12 - 6; // -6..+6 gradi
          const deg = base - 90 + jitter; // centro intorno a 0

          star.style.setProperty("--cross-rot", `${deg.toFixed(2)}deg`);
          // opzionale: tienilo anche in data-attr per debuggare
          star.dataset.crossRot = deg.toFixed(2);
        });
      }
      const stelleHero = hero.querySelectorAll(".star");
      if (!stelleHero.length) return false;

      // 👇 assicura che le stelle della HERO abbiano già l’angolo
      setCrossRotations(hero);

      splash.innerHTML = "";
      stelleHero.forEach((star) => splash.appendChild(star.cloneNode(true)));

      splash.querySelectorAll(".star").forEach((star) => {
        if (!star.querySelector(".trail")) {
          const t = document.createElement("i");
          t.className = "trail";
          star.appendChild(t);
        }
      });

      setupSplashIntroVectors();
      // (se hai la funzione che schedula la nascita, lasciala qui)
      if (typeof scheduleBirthsFullSpan === "function")
        scheduleBirthsFullSpan();

      return true;
    }

    if (!copiaStelleDallaHero()) {
      const obs = new MutationObserver(() => {
        if (copiaStelleDallaHero()) obs.disconnect();
      });
      obs.observe(hero, { childList: true });
      window.addEventListener("load", () => copiaStelleDallaHero(), {
        once: true,
      });
    }

    // Se cambia misura schermo/ring, ricalcola i vettori (i tempi restano ok)
    window.addEventListener("resize", setupSplashIntroVectors, {
      passive: true,
    });
  })();

  // Precarica il video del modal per evitare scatti al primo avvio
  (function () {
    const vid = document.querySelector("#geoModal video.geo-media");
    if (vid) {
      vid.preload = "auto";
      // Safari a volte richiede .load() esplicito
      try {
        vid.load();
      } catch (e) {}
    }
  })();
  // Inizializza
  createHeroStars(HERO_STARS);

  // Pausa quando la HERO esce/entra dal viewport
  const hero = document.querySelector(".hero");
  if (hero && heroStarfield) {
    const io = new IntersectionObserver(
      ([entry]) => {
        heroStarfield.classList.toggle("paused", !entry.isIntersecting);
      },
      { threshold: 0.25 }
    ); // 5% visibile basta
    io.observe(hero);
  }

  // Pausa quando la tab è in background
  document.addEventListener("visibilitychange", () => {
    heroStarfield.classList.toggle("paused", document.hidden);
  });

  // 🔧 Modalità “pick” posizioni: usa #edit-stars nell’URL
  if (location.hash === "#edit-stars") {
    const hero = document.querySelector(".hero");
    if (hero) {
      hero.style.cursor = "crosshair";
      hero.addEventListener("click", (e) => {
        const r = hero.getBoundingClientRect();
        const xPct = ((e.clientX - r.left) / r.width) * 100;
        const yPct = ((e.clientY - r.top) / r.height) * 100;
        const item = `{ x: '${xPct.toFixed(2)}%', y: '${yPct.toFixed(
          2
        )}%', size: 2 },`;
        console.log(item);
      });
    }
  }
})();

// === GEO ICON MODAL (video o immagine) ===
(function () {
  const buttons = Array.from(document.querySelectorAll(".geo-icon"));
  const modal = document.getElementById("geoModal");
  const content = modal ? modal.querySelector(".video-content") : null;

  // elementi media (video + source + img)
  const videoEl = modal ? modal.querySelector("video.geo-media") : null;
  const videoSrc = videoEl ? videoEl.querySelector("source") : null;
  let imgEl = modal ? modal.querySelector("img.geo-media") : null;

  const msg = document.getElementById("geoMessage");
  let currentBtn = null;
  let currentType = null; // "video" | "image"
  let autoCloseTimer = null;

  if (!buttons.length || !modal || !content) return;

  // Se l'img non è in HTML lo creo io (fallback)
  if (!imgEl) {
    imgEl = document.createElement("img");
    imgEl.className = "geo-media";
    imgEl.alt = "";
    imgEl.style.display = "none";
    content.appendChild(imgEl);
  }

  function positionTransformOrigin(btn) {
    const iconRect = btn.getBoundingClientRect();
    const contentRect = content.getBoundingClientRect();
    const x = iconRect.left + iconRect.width / 2 - contentRect.left;
    const y = iconRect.top + iconRect.height / 2 - contentRect.top;
    content.style.transformOrigin = `${x}px ${y}px`;
  }

  function openFrom(btn) {
    currentBtn = btn;

    // Tooltip al tocco
    if (msg) {
      msg.textContent = btn.dataset.message || "";
      const r = btn.getBoundingClientRect();
      msg.style.top = r.bottom + 8 + "px";
      msg.style.left = r.left + r.width / 2 + "px";
      msg.classList.add("show");
    }

    setTimeout(() => {
      if (msg) msg.classList.remove("show");

      modal.classList.add("preopen");
      modal.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
      document.body.classList.add("modal-open");

      modal.offsetHeight; // reflow
      positionTransformOrigin(btn);

      const imgUrl = btn.dataset.image;
      const vidUrl = btn.dataset.video;

      if (imgUrl) {
        currentType = "image";
        // mostra IMG, nascondi VIDEO
        if (videoEl) {
          try {
            videoEl.pause();
          } catch (e) {}
          videoEl.style.display = "none";
        }
        imgEl.src = imgUrl;
        imgEl.style.display = "block";
      } else {
        currentType = "video";
        imgEl.style.display = "none";
        if (videoEl && videoSrc) {
          const url = vidUrl || videoSrc.getAttribute("src") || "";
          if (url) {
            videoSrc.setAttribute("src", url);
            try {
              videoEl.load();
            } catch (e) {}
          }
          videoEl.style.display = "block";
        }
      }

      requestAnimationFrame(() => {
        modal.classList.remove("preopen");
        modal.classList.add("open");

        // Autochiusura opzionale per le icone che lo chiedono
        const ms = parseInt(btn.dataset.autoclose, 10);
        if (!isNaN(ms) && ms > 0) {
          if (autoCloseTimer) clearTimeout(autoCloseTimer);
          autoCloseTimer = setTimeout(() => {
            // chiudi solo se è ancora aperto e proviene dalla stessa icona
            if (modal.classList.contains("open") && currentBtn === btn) {
              closeFn();
            }
          }, ms);
        }

        if (currentType === "video" && videoEl) {
          try {
            videoEl.currentTime = 0;
          } catch (e) {}
          const onZoomEnd = (e) => {
            if (e.animationName === "zoomIn") {
              videoEl.play().catch(() => {});
              content.removeEventListener("animationend", onZoomEnd);
            }
          };
          content.addEventListener("animationend", onZoomEnd);
        }
      });
    }, 750);
  }

  function closeFn() {
    if (autoCloseTimer) {
      clearTimeout(autoCloseTimer);
      autoCloseTimer = null;
    }
    if (currentBtn) positionTransformOrigin(currentBtn);
    modal.classList.add("closing");
    setTimeout(() => {
      modal.classList.remove("open", "closing");
      modal.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
      document.body.classList.remove("modal-open");
      if (videoEl)
        try {
          videoEl.pause();
        } catch (e) {}
      if (imgEl) imgEl.style.display = "none";
      currentBtn = null;
      currentType = null;
    }, 500);
  }

  // Apertura/chiusura
  buttons.forEach((b) => b.addEventListener("click", () => openFrom(b)));
  if (videoEl) {
    videoEl.addEventListener("ended", closeFn);
    videoEl.addEventListener("timeupdate", () => {
      if (videoEl.duration && videoEl.currentTime >= videoEl.duration - 0.05)
        closeFn();
    });
  }
  // Chiudi cliccando fuori dal contenuto
  modal.addEventListener("click", (e) => {
    if (!content.contains(e.target)) closeFn();
  });
  // Chiudi con ESC
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("open")) closeFn();
  });
})();

// === DISCOVER PANEL: open/close on "DISCOVER" side-tab ===
(function () {
  const openBtn = document.querySelector(".side-tab--right");
  const panel = document.getElementById("discoverPanel");
  const overlay = document.getElementById("discoverOverlay");
  const closeBtn = document.getElementById("discoverClose");
  const video = document.getElementById("discoverVideo");
  const skipBtn = document.getElementById("discoverSkip"); // <-- UNA SOLA dichiarazione

  // Listener Skip: 3× + assicurare play
  if (skipBtn && video) {
    skipBtn.addEventListener("click", () => {
      try {
        video.playbackRate = 8.0; // velocità 3x
        video.play().catch(() => {});
        skipBtn.style.display = "none"; // Nascondi subito il bottone
      } catch (e) {
        console.warn("PlaybackRate non supportato:", e);
      }
    });

    // Nascondi bottone alla fine
    video.addEventListener("ended", () => {
      skipBtn.style.display = "none";
    });

    // Mostra bottone quando riparte
    video.addEventListener("play", () => {
      if (video.playbackRate === 1.0) {
        skipBtn.style.display = "block";
      }
    });
  }

  if (!openBtn || !panel || !overlay || !closeBtn) return;

  const focusableSel =
    'a,button,input,select,textarea,[tabindex]:not([tabindex="-1"])';
  let lastFocused = null;

  function setOpenState(isOpen) {
    panel.setAttribute("aria-hidden", String(!isOpen));
    overlay.setAttribute("aria-hidden", String(!isOpen));
    document.body.classList.toggle("discover-open", isOpen);

    if (video) {
      if (isOpen) {
        // riapertura: mostra di nuovo Skip e riparti dal principio a 1x
        if (skipBtn) skipBtn.style.display = "block";
        video.playbackRate = 1.0;
        video.currentTime = 0;
        video.play().catch(() => {});
      } else {
        video.pause();
        video.playbackRate = 1.0; // reset velocità alla chiusura
      }
    }

    if (isOpen) {
      lastFocused = document.activeElement;
      const focusables = panel.querySelectorAll(focusableSel);
      (focusables[0] || closeBtn).focus();
    } else {
      if (lastFocused && lastFocused.focus) lastFocused.focus();
    }
  }

  function openPanel(e) {
    if (e) e.preventDefault();
    setOpenState(true);
  }
  function closePanel() {
    setOpenState(false);
  }

  openBtn.addEventListener("click", openPanel);
  closeBtn.addEventListener("click", closePanel);
  overlay.addEventListener("click", closePanel);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && panel.getAttribute("aria-hidden") === "false") {
      closePanel();
    }
  });

  panel.addEventListener("keydown", (e) => {
    if (e.key !== "Tab") return;
    const focusables = [...panel.querySelectorAll(focusableSel)].filter(
      (el) => !el.hasAttribute("disabled")
    );
    if (!focusables.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      last.focus();
      e.preventDefault();
    } else if (!e.shiftKey && document.activeElement === last) {
      first.focus();
      e.preventDefault();
    }
  });
})();
