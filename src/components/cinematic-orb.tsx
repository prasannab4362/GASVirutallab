"use client";

import { useEffect, useRef } from "react";

export default function CinematicOrb() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf: number;
    let t = 0;

    const resize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    window.addEventListener("resize", resize);
    resize();

    // Orbit ring data
    const rings = [
      { rx: 1.00, ry: 0.30, speed: 0.007, phase: 0,           color: "rgba(16,185,129," },
      { rx: 0.90, ry: 0.40, speed: -0.009, phase: Math.PI / 3, color: "rgba(139,92,246," },
      { rx: 0.80, ry: 0.25, speed: 0.011, phase: Math.PI,      color: "rgba(59,130,246," },
    ];

    // Floating data nodes
    interface Node { angle: number; dist: number; speed: number; size: number; color: string; trail: {x:number,y:number}[] }
    const nodes: Node[] = Array.from({ length: 14 }, (_, i) => ({
      angle: (i / 14) * Math.PI * 2,
      dist:  120 + (i % 4) * 28,
      speed: (i % 2 === 0 ? 1 : -1) * (0.006 + i * 0.0012),
      size:  2 + (i % 3),
      color: ["rgba(16,185,129,","rgba(139,92,246,","rgba(59,130,246,"][i % 3],
      trail: [],
    }));

    // Energy pulse rings (burst outward from center)
    const pulses: { r: number; alpha: number; speed: number; color: string }[] = [];
    let pulseTimer = 0;

    const draw = () => {
      t += 0.016;
      pulseTimer += 1;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const cx = canvas.width  / 2;
      const cy = canvas.height / 2;
      const baseR = Math.min(canvas.width, canvas.height) * 0.22;

      // ── Spawn energy pulses ──
      if (pulseTimer % 80 === 0) {
        pulses.push({
          r: baseR * 0.4,
          alpha: 0.5,
          speed: 1.8,
          color: ["rgba(16,185,129,","rgba(139,92,246,","rgba(59,130,246,"][Math.floor(Math.random() * 3)],
        });
      }

      // ── Draw & update pulses ──
      pulses.forEach((p, i) => {
        p.r += p.speed;
        p.alpha *= 0.97;
        ctx.beginPath();
        ctx.arc(cx, cy, p.r, 0, Math.PI * 2);
        ctx.strokeStyle = p.color + p.alpha + ")";
        ctx.lineWidth = 1.5;
        ctx.stroke();
        if (p.alpha < 0.01 || p.r > baseR * 3.5) pulses.splice(i, 1);
      });

      // ── Core orb — multi-layer glow ──
      const glowSizes = [2.2, 1.6, 1.2, 0.9, 0.6, 0.35];
      const glowOpacities = [0.04, 0.07, 0.10, 0.18, 0.32, 0.55];
      glowSizes.forEach((mul, i) => {
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, baseR * mul);
        const wobble = Math.sin(t * 1.1 + i) * 0.03;
        g.addColorStop(0, `rgba(16,185,129,${glowOpacities[i] + wobble})`);
        g.addColorStop(0.5, `rgba(139,92,246,${glowOpacities[i] * 0.6})`);
        g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.beginPath();
        ctx.arc(cx, cy, baseR * mul, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();
      });

      // ── Inner orb solid ──
      const morphR = baseR * 0.38 + Math.sin(t * 0.8) * baseR * 0.04;
      const innerGrad = ctx.createRadialGradient(cx - morphR * 0.2, cy - morphR * 0.2, 0, cx, cy, morphR);
      innerGrad.addColorStop(0, "rgba(255,255,255,0.25)");
      innerGrad.addColorStop(0.4, "rgba(16,185,129,0.55)");
      innerGrad.addColorStop(0.75, "rgba(5,150,105,0.70)");
      innerGrad.addColorStop(1, "rgba(4,120,87,0.85)");
      ctx.beginPath();
      ctx.arc(cx, cy, morphR, 0, Math.PI * 2);
      ctx.fillStyle = innerGrad;
      ctx.fill();

      // Specular highlight
      const specX = cx - morphR * 0.28;
      const specY = cy - morphR * 0.28;
      const specG = ctx.createRadialGradient(specX, specY, 0, specX, specY, morphR * 0.45);
      specG.addColorStop(0, "rgba(255,255,255,0.35)");
      specG.addColorStop(1, "rgba(255,255,255,0)");
      ctx.beginPath();
      ctx.arc(cx, cy, morphR, 0, Math.PI * 2);
      ctx.fillStyle = specG;
      ctx.fill();

      // ── Orbit rings (ellipse illusion) ──
      rings.forEach(ring => {
        ring.phase += ring.speed;
        const orbitR = baseR * 1.15;

        ctx.save();
        ctx.translate(cx, cy);
        ctx.scale(1, ring.ry);
        ctx.beginPath();
        ctx.ellipse(0, 0, orbitR * ring.rx, orbitR * ring.rx, 0, 0, Math.PI * 2);
        const gradient = ctx.createLinearGradient(-orbitR, 0, orbitR, 0);
        gradient.addColorStop(0,   ring.color + "0)");
        gradient.addColorStop(0.3, ring.color + "0.25)");
        gradient.addColorStop(0.5, ring.color + "0.55)");
        gradient.addColorStop(0.7, ring.color + "0.25)");
        gradient.addColorStop(1,   ring.color + "0)");
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Dot on ring
        const dotX = Math.cos(ring.phase) * orbitR * ring.rx;
        const dotY = Math.sin(ring.phase) * orbitR * ring.rx * ring.ry;
        ctx.restore();

        // Convert back from scale(1, ry) coords
        const rdx = Math.cos(ring.phase) * orbitR * ring.rx;
        const rdy = Math.sin(ring.phase) * orbitR * ring.rx * ring.ry;

        // Dot glow
        const dg = ctx.createRadialGradient(cx + rdx, cy + rdy, 0, cx + rdx, cy + rdy, 8);
        dg.addColorStop(0, ring.color + "1)");
        dg.addColorStop(1, ring.color + "0)");
        ctx.beginPath();
        ctx.arc(cx + rdx, cy + rdy, 5, 0, Math.PI * 2);
        ctx.fillStyle = dg;
        ctx.fill();
      });

      // ── Floating data nodes with trails ──
      nodes.forEach(node => {
        node.angle += node.speed;
        const nx = cx + Math.cos(node.angle) * node.dist;
        const ny = cy + Math.sin(node.angle) * (node.dist * 0.55);

        node.trail.push({ x: nx, y: ny });
        if (node.trail.length > 10) node.trail.shift();

        // Trail
        node.trail.forEach((pt, i) => {
          const a = (i / node.trail.length) * 0.35;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, node.size * 0.5, 0, Math.PI * 2);
          ctx.fillStyle = node.color + a + ")";
          ctx.fill();
        });

        // Node
        const ng = ctx.createRadialGradient(nx, ny, 0, nx, ny, node.size * 3);
        ng.addColorStop(0, node.color + "0.9)");
        ng.addColorStop(0.4, node.color + "0.4)");
        ng.addColorStop(1, node.color + "0)");
        ctx.beginPath();
        ctx.arc(nx, ny, node.size * 3, 0, Math.PI * 2);
        ctx.fillStyle = ng;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(nx, ny, node.size, 0, Math.PI * 2);
        ctx.fillStyle = node.color + "1)";
        ctx.fill();

        // Connecting line to core
        const lineDist = Math.sqrt((nx - cx) ** 2 + (ny - cy) ** 2);
        const la = Math.max(0, 1 - lineDist / (baseR * 1.5)) * 0.12;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(nx, ny);
        ctx.strokeStyle = node.color + la + ")";
        ctx.lineWidth = 0.8;
        ctx.stroke();
      });

      // ── Outer halo ring ──
      const haloR = baseR * 1.55 + Math.sin(t * 0.6) * 6;
      const haloGrad = ctx.createRadialGradient(cx, cy, haloR - 12, cx, cy, haloR + 12);
      haloGrad.addColorStop(0, "rgba(16,185,129,0)");
      haloGrad.addColorStop(0.5, `rgba(16,185,129,${0.06 + Math.sin(t) * 0.02})`);
      haloGrad.addColorStop(1, "rgba(16,185,129,0)");
      ctx.beginPath();
      ctx.arc(cx, cy, haloR, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(16,185,129,${0.12 + Math.sin(t * 0.9) * 0.05})`;
      ctx.lineWidth = 1;
      ctx.stroke();

      raf = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      style={{ display: "block" }}
    />
  );
}
