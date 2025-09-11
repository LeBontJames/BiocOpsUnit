import React, { useEffect, useRef } from "react";

/**
 * SpiralGalaxy
 * - width, height: dimensioni CSS del canvas (px)
 * - particleCount, maxRadius, spiralArms, rotationSpeed: parametri dell'animazione
 * - className, style: per ulteriori personalizzazioni del contenitore
 * - paused: per avviare/fermare l'animazione
 */
export default function SpiralGalaxy({
  width = 180,
  height = 180,
  particleCount = 400,
  maxRadius = 75,
  spiralArms = 3,
  rotationSpeed = 0.01,
  className,
  style,
  paused = false,
}) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Retina / HiDPI scaling
    const dpr = Math.max(1, Math.floor(window.devicePixelRatio || 1));
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    canvas.width = width * dpr;
    canvas.height = height * dpr;

    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); // disegna in coordinate CSS

    const centerX = width / 2;
    const centerY = height / 2;

    // Particelle iniziali (generate una sola volta per evitare jitter)
    const particles = [];
    for (let i = 0; i < particleCount; i++) {
  const distanceFactor = Math.pow(Math.random(), 0.5); // più denso al centro
      const distance = distanceFactor * maxRadius;

      const armIndex = Math.floor(Math.random() * spiralArms);
      const armOffset = (armIndex / spiralArms) * Math.PI * 2;

      const spiralTightness = 0.2;
      const spiralAngle = Math.log(Math.max(distance, 1e-6) / 5) / spiralTightness;

      // Sfumatura dal centro rosso all'esterno bianco
      const t = distance / maxRadius; // 0 = centro, 1 = bordo
      const r = Math.round(255 * (1 - t) + 255 * t); // rosso -> bianco
      const g = Math.round(40 * (1 - t) + 255 * t); // rosso -> bianco
      const b = Math.round(40 * (1 - t) + 255 * t); // rosso -> bianco
      particles.push({
        distance,
        angle0: spiralAngle + armOffset,
        armIndex,
  size: 0.3 + Math.random() * 0.3 + (1 - t) * 0.25,
  opacity: 0.15 + Math.random() * 0.5,
        speedFactor: 0.8 + Math.random() * 0.4,
        color: { r, g, b },
      });
    }

  let lastTime = 0;
  let time = 0;
  let galaxyRotation = 0;
  // Variabile per effetto scala
  let scale = 1;

    const animate = (timestamp) => {
      if (paused) {
        // se messo in pausa, schedula comunque il prossimo frame per reattività
        rafRef.current = requestAnimationFrame(animate);
        return;
      }

      if (!lastTime) lastTime = timestamp;
      const deltaTime = timestamp - lastTime;
      lastTime = timestamp;
      time += deltaTime * 0.001;

      // Effetto scala ogni 3 secondi
      const scalePeriod = 3.0;
  const scaleDuration = 1.2;
      const scaleMax = 1.4;
      const scaleMin = 1.0;
      const modTime = time % scalePeriod;
      if (modTime < scaleDuration) {
        // Ease in-out simmetrica su tutta la durata
        const t = modTime / scaleDuration;
        scale = scaleMin + (scaleMax - scaleMin) * (0.5 - 0.5 * Math.cos(Math.PI * 2 * t));
      } else {
        scale = scaleMin;
      }

      ctx.clearRect(0, 0, width, height);
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.scale(scale, scale);
      ctx.translate(-centerX, -centerY);

      // ruota la galassia globalmente
      galaxyRotation += rotationSpeed * deltaTime * 0.05;

      // nucleo (punto centrale più piccolo)
      ctx.beginPath();
      ctx.arc(centerX, centerY, 1.2, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,255,255,0.3)";
      ctx.fill();

      // particelle
      for (const p of particles) {
        const angle = p.angle0 + galaxyRotation;
        const x = centerX + Math.cos(angle) * p.distance;
        const y = centerY + Math.sin(angle) * p.distance;

        const armPhase = (time * 0.5 + p.armIndex / spiralArms) % 1;
        const pulseFactor = Math.sin(armPhase * Math.PI * 2) * 0.3 + 0.7;

        const finalOpacity = p.opacity * pulseFactor;

        // punto
        ctx.beginPath();
        ctx.arc(x, y, p.size * pulseFactor, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${finalOpacity})`;
        ctx.fill();

        // scia per i più grandi
        if (p.size > 1.8) {
          const trailLength = p.distance * 0.15;
          const trailAngle = angle - 0.1;
          const trailX = centerX + Math.cos(trailAngle) * (p.distance - trailLength);
          const trailY = centerY + Math.sin(trailAngle) * (p.distance - trailLength);

          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(trailX, trailY);
          ctx.strokeStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${finalOpacity * 0.3})`;
          ctx.lineWidth = p.size * 0.5;
          ctx.stroke();
        }
      }

  ctx.restore();
  rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    // cleanup su unmount o cambio dimensioni/props critiche
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [width, height, particleCount, maxRadius, spiralArms, rotationSpeed, paused]);

  return (
    <div
      className={className}
      style={{ position: "relative", width, height, ...style }}
      aria-label="Spiral galaxy animation"
      role="img"
    >
      <canvas ref={canvasRef} />
    </div>
  );
}
