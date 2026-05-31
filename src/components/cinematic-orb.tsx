"use client";

import { useEffect, useRef } from "react";

// Domain color palette mapped to GAS's 6 disciplines
const DOMAIN_COLORS = [
  { h: 160, s: 80, l: 50, name: "AI / ML"        },  // emerald-green
  { h: 210, s: 85, l: 55, name: "IoT"             },  // blue
  { h: 262, s: 80, l: 60, name: "Robotics"        },  // violet
  { h:  38, s: 90, l: 52, name: "Arduino/Embedded" }, // amber
  { h: 335, s: 80, l: 60, name: "Web Dev"         },  // pink
  { h: 188, s: 85, l: 45, name: "Automation"      },  // cyan
];

function hsl(h: number, s: number, l: number, a = 1) {
  return `hsla(${h},${s}%,${l}%,${a})`;
}

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

    // ── 6 orbit rings — one per domain ──
    type Ring = { speed: number; phase: number; tilt: number; domain: typeof DOMAIN_COLORS[0] };
    const rings: Ring[] = DOMAIN_COLORS.map((domain, i) => ({
      speed:  (i % 2 === 0 ? 1 : -1) * (0.006 + i * 0.0015),
      phase:  (i / 6) * Math.PI * 2,
      tilt:   0.15 + i * 0.09,
      domain,
    }));

    // ── 18 floating data nodes ──
    type Node = { angle: number; dist: number; speed: number; size: number; domain: typeof DOMAIN_COLORS[0]; trail: {x:number;y:number}[] };
    const nodes: Node[] = Array.from({ length: 18 }, (_, i) => ({
      angle:  (i / 18) * Math.PI * 2,
      dist:   100 + (i % 5) * 26,
      speed:  (i % 2 === 0 ? 1 : -1) * (0.005 + i * 0.001),
      size:   1.5 + (i % 4) * 0.6,
      domain: DOMAIN_COLORS[i % DOMAIN_COLORS.length],
      trail:  [],
    }));

    // ── Energy pulses ──
    const pulses: { r: number; alpha: number; speed: number; domain: typeof DOMAIN_COLORS[0] }[] = [];
    let pulseTimer = 0;
    let pulseDomainIdx = 0;

    // ── Domain label text flash ──
    let labelTimer = 0;
    let currentLabel = DOMAIN_COLORS[0];
    let labelAlpha = 0;

    const draw = () => {
      t += 0.016;
      pulseTimer++;
      labelTimer++;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cx = canvas.width  / 2;
      const cy = canvas.height / 2;
      const baseR = Math.min(canvas.width, canvas.height) * 0.21;

      // ── Spawn pulse every ~2.5s, cycling through domains ──
      if (pulseTimer % 95 === 0) {
        const dom = DOMAIN_COLORS[pulseDomainIdx % DOMAIN_COLORS.length];
        pulses.push({ r: baseR * 0.45, alpha: 0.55, speed: 1.7, domain: dom });
        if (pulseTimer % 285 === 0) {
          currentLabel = dom;
          labelAlpha = 1;
        }
        pulseDomainIdx++;
      }
      if (labelAlpha > 0) labelAlpha -= 0.012;

      // ── Update & draw pulses ──
      for (let i = pulses.length - 1; i >= 0; i--) {
        const p = pulses[i];
        p.r += p.speed;
        p.alpha *= 0.971;
        ctx.beginPath();
        ctx.arc(cx, cy, p.r, 0, Math.PI * 2);
        ctx.strokeStyle = hsl(p.domain.h, p.domain.s, p.domain.l, p.alpha);
        ctx.lineWidth = 1.5;
        ctx.stroke();
        if (p.alpha < 0.01 || p.r > baseR * 3.5) pulses.splice(i, 1);
      }

      // ── Multi-layer glow halos (each shifts hue gently) ──
      const haloSizes = [2.4, 1.8, 1.35, 1.0, 0.7, 0.42];
      const haloAlphas = [0.035, 0.06, 0.09, 0.16, 0.30, 0.50];
      haloSizes.forEach((mul, i) => {
        const hueShift = Math.sin(t * 0.3 + i) * 40;   // smoothly cycles hue
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, baseR * mul);
        g.addColorStop(0,   hsl(160 + hueShift, 75, 55, haloAlphas[i]));
        g.addColorStop(0.45,hsl(262 + hueShift, 70, 55, haloAlphas[i] * 0.5));
        g.addColorStop(1,   "rgba(0,0,0,0)");
        ctx.beginPath();
        ctx.arc(cx, cy, baseR * mul, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();
      });

      // ── Core orb solid (hue-cycles through domain colors) ──
      const morphR  = baseR * 0.38 + Math.sin(t * 0.8) * baseR * 0.035;
      const coreHue = ((t * 8) % 360);   // slowly cycles all hues
      const ig = ctx.createRadialGradient(cx - morphR * 0.22, cy - morphR * 0.22, 0, cx, cy, morphR);
      ig.addColorStop(0,    "rgba(255,255,255,0.22)");
      ig.addColorStop(0.35, hsl(coreHue,        80, 55, 0.60));
      ig.addColorStop(0.72, hsl(coreHue + 30,   75, 42, 0.75));
      ig.addColorStop(1,    hsl(coreHue + 55,   70, 32, 0.90));
      ctx.beginPath();
      ctx.arc(cx, cy, morphR, 0, Math.PI * 2);
      ctx.fillStyle = ig;
      ctx.fill();

      // Specular highlight
      const sg = ctx.createRadialGradient(cx - morphR * 0.3, cy - morphR * 0.3, 0, cx - morphR * 0.3, cy - morphR * 0.3, morphR * 0.5);
      sg.addColorStop(0, "rgba(255,255,255,0.32)");
      sg.addColorStop(1, "rgba(255,255,255,0)");
      ctx.beginPath();
      ctx.arc(cx, cy, morphR, 0, Math.PI * 2);
      ctx.fillStyle = sg;
      ctx.fill();

      // ── 6 domain orbit rings ──
      rings.forEach(ring => {
        ring.phase += ring.speed;
        const rx = baseR * 1.18;
        const ry = rx * ring.tilt;

        ctx.save();
        ctx.translate(cx, cy);

        // Ring path
        ctx.beginPath();
        ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
        const rg = ctx.createLinearGradient(-rx, 0, rx, 0);
        rg.addColorStop(0,    hsl(ring.domain.h, ring.domain.s, ring.domain.l, 0));
        rg.addColorStop(0.3,  hsl(ring.domain.h, ring.domain.s, ring.domain.l, 0.22));
        rg.addColorStop(0.5,  hsl(ring.domain.h, ring.domain.s, ring.domain.l, 0.55));
        rg.addColorStop(0.7,  hsl(ring.domain.h, ring.domain.s, ring.domain.l, 0.22));
        rg.addColorStop(1,    hsl(ring.domain.h, ring.domain.s, ring.domain.l, 0));
        ctx.strokeStyle = rg;
        ctx.lineWidth = 1.2;
        ctx.stroke();
        ctx.restore();

        // Moving dot on ring
        const dotX = cx + Math.cos(ring.phase) * rx;
        const dotY = cy + Math.sin(ring.phase) * ry;
        const dg = ctx.createRadialGradient(dotX, dotY, 0, dotX, dotY, 8);
        dg.addColorStop(0, hsl(ring.domain.h, ring.domain.s, ring.domain.l, 1));
        dg.addColorStop(1, hsl(ring.domain.h, ring.domain.s, ring.domain.l, 0));
        ctx.beginPath(); ctx.arc(dotX, dotY, 7, 0, Math.PI * 2);
        ctx.fillStyle = dg; ctx.fill();
        ctx.beginPath(); ctx.arc(dotX, dotY, 3, 0, Math.PI * 2);
        ctx.fillStyle = hsl(ring.domain.h, ring.domain.s, 90, 0.95);
        ctx.fill();
      });

      // ── Floating data nodes with trails ──
      nodes.forEach(node => {
        node.angle += node.speed;
        const nx = cx + Math.cos(node.angle) * node.dist;
        const ny = cy + Math.sin(node.angle) * (node.dist * 0.52);

        node.trail.push({ x: nx, y: ny });
        if (node.trail.length > 12) node.trail.shift();

        // Trail
        node.trail.forEach((pt, i) => {
          const a = (i / node.trail.length) * 0.3;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, node.size * 0.55, 0, Math.PI * 2);
          ctx.fillStyle = hsl(node.domain.h, node.domain.s, node.domain.l, a);
          ctx.fill();
        });

        // Node glow
        const ng = ctx.createRadialGradient(nx, ny, 0, nx, ny, node.size * 3.5);
        ng.addColorStop(0, hsl(node.domain.h, node.domain.s, node.domain.l, 0.9));
        ng.addColorStop(1, hsl(node.domain.h, node.domain.s, node.domain.l, 0));
        ctx.beginPath(); ctx.arc(nx, ny, node.size * 3.5, 0, Math.PI * 2);
        ctx.fillStyle = ng; ctx.fill();
        ctx.beginPath(); ctx.arc(nx, ny, node.size, 0, Math.PI * 2);
        ctx.fillStyle = hsl(node.domain.h, node.domain.s, 88, 1);
        ctx.fill();

        // Line to core
        const lineDist = Math.hypot(nx - cx, ny - cy);
        const la = Math.max(0, (1 - lineDist / (baseR * 1.5)) * 0.14);
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(nx, ny);
        ctx.strokeStyle = hsl(node.domain.h, node.domain.s, node.domain.l, la);
        ctx.lineWidth = 0.7; ctx.stroke();
      });

      // ── Outer breathing halo ring ──
      const haloR = baseR * 1.6 + Math.sin(t * 0.65) * 5;
      ctx.beginPath();
      ctx.arc(cx, cy, haloR, 0, Math.PI * 2);
      ctx.strokeStyle = hsl(160 + Math.sin(t * 0.4) * 80, 70, 55, 0.12 + Math.sin(t * 0.9) * 0.04);
      ctx.lineWidth = 0.8;
      ctx.stroke();

      // ── Domain label (flashes on each pulse) ──
      if (labelAlpha > 0.05) {
        ctx.save();
        ctx.globalAlpha = Math.min(labelAlpha, 0.9);
        ctx.font = `bold ${Math.round(baseR * 0.22)}px system-ui, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = hsl(currentLabel.h, currentLabel.s, currentLabel.l, 1);
        ctx.fillText(currentLabel.name, cx, cy);
        ctx.restore();
      }

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
