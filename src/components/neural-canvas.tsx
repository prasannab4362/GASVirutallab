"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  radius: number; baseRadius: number;
  hue: number; // 150=green, 260=violet, 220=blue
}

export default function NeuralCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0, active: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf: number;
    let particles: Particle[] = [];
    const MAX = 90;
    const CONNECT_DIST = 120;
    const MOUSE_DIST   = 200;

    const resize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      init();
    };

    const hues = [152, 152, 260, 220]; // mostly green, some violet/blue

    const init = () => {
      particles = Array.from({ length: MAX }, () => {
        const r = Math.random() * 2 + 1;
        return {
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.45,
          vy: (Math.random() - 0.5) * 0.45,
          radius: r, baseRadius: r,
          hue: hues[Math.floor(Math.random() * hues.length)],
        };
      });
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const m = mouseRef.current;

      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width)  { p.vx *= -1; p.x = Math.max(0, Math.min(canvas.width,  p.x)); }
        if (p.y < 0 || p.y > canvas.height)  { p.vy *= -1; p.y = Math.max(0, Math.min(canvas.height, p.y)); }

        if (m.active) {
          const dx = m.x - p.x, dy = m.y - p.y;
          const d = Math.hypot(dx, dy);
          if (d < MOUSE_DIST) {
            const f = (MOUSE_DIST - d) / MOUSE_DIST;
            p.x += (dx / d) * f * 0.5;
            p.y += (dy / d) * f * 0.5;
            p.radius = p.baseRadius * (1 + f * 1.5);
          } else { p.radius = p.baseRadius; }
        } else { p.radius = p.baseRadius; }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue},80%,60%,0.35)`;
        ctx.fill();
      });

      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const d = Math.hypot(p1.x - p2.x, p1.y - p2.y);
          if (d < CONNECT_DIST) {
            const a = (1 - d / CONNECT_DIST) * 0.18;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `hsla(${p1.hue},70%,55%,${a})`;
            ctx.lineWidth = 0.7;
            ctx.stroke();
          }
        }
        if (m.active) {
          const d = Math.hypot(m.x - p1.x, m.y - p1.y);
          if (d < MOUSE_DIST) {
            const a = (1 - d / MOUSE_DIST) * 0.35;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(m.x, m.y);
            ctx.strokeStyle = `hsla(152,80%,55%,${a})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      raf = requestAnimationFrame(draw);
    };

    const onMove  = (e: MouseEvent) => { const r = canvas.getBoundingClientRect(); mouseRef.current = { x: e.clientX - r.left, y: e.clientY - r.top, active: true }; };
    const onLeave = ()              => { mouseRef.current.active = false; };

    window.addEventListener("resize", resize);
    canvas.addEventListener("mousemove",  onMove);
    canvas.addEventListener("mouseleave", onLeave);
    resize();
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousemove",  onMove);
      canvas.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none -z-[5]"
      style={{ opacity: 0.45 }}
    />
  );
}
