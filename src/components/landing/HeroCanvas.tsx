"use client";

import { useRef, useEffect } from "react";

/**
 * Abstract 3D hero backdrop using Canvas 2D (avoids Three.js bundle weight).
 * Renders floating rings/arcs in the terracotta/ivory palette.
 * Respects prefers-reduced-motion — shows static version if reduced motion preferred.
 * On mobile (< 768px) a static blurred gradient circle is shown instead.
 */
export default function HeroCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isMobile = window.innerWidth < 768;

    function resize() {
      if (!canvas) return;
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    if (prefersReduced || isMobile) {
      // Static gradient blob
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.min(cx, cy) * 1.5);
      gradient.addColorStop(0, "rgba(196, 98, 45, 0.15)");
      gradient.addColorStop(0.5, "rgba(196, 98, 45, 0.04)");
      gradient.addColorStop(1, "transparent");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      return;
    }

    let t = 0;
    const rings = Array.from({ length: 5 }, (_, i) => ({
      x: canvas.width / 2 + (Math.random() - 0.5) * 200,
      y: canvas.height / 2 + (Math.random() - 0.5) * 200,
      r: 80 + i * 60,
      speed: 0.0003 + i * 0.0002,
      phase: i * (Math.PI / 2.5),
      alpha: 0.04 + (i % 3) * 0.015,
      lineWidth: 1 + (i % 2) * 0.5,
    }));

    function draw() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Ambient glow
      const glow = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, 400);
      glow.addColorStop(0, "rgba(255, 107, 53, 0.06)");
      glow.addColorStop(1, "transparent");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Animated rings
      rings.forEach((ring, i) => {
        const angle = t * ring.speed + ring.phase;
        const cx = ring.x + Math.cos(angle * 0.7) * 40;
        const cy = ring.y + Math.sin(angle * 0.5) * 30;

        ctx.beginPath();
        ctx.ellipse(cx, cy, ring.r * (1 + Math.sin(angle) * 0.05), ring.r * 0.55, angle * 0.1, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(196, 98, 45, ${ring.alpha})`;
        ctx.lineWidth = ring.lineWidth;
        ctx.stroke();

        // Ivory thin arc
        ctx.beginPath();
        ctx.arc(cx, cy, ring.r * 0.72, angle, angle + 1.2);
        ctx.strokeStyle = `rgba(245, 241, 232, ${ring.alpha * 0.5})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      });

      t++;
      rafRef.current = requestAnimationFrame(draw);
    }
    draw();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full opacity-80"
      aria-hidden
    />
  );
}
