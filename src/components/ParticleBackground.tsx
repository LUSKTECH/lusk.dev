'use client';

import { useEffect, useRef, useCallback } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  opacity: number;
  baseOpacity: number;
  color: string;
  trail: { x: number; y: number }[];
}

interface Ripple {
  x: number;
  y: number;
  r: number;
  maxR: number;
  alpha: number;
}

const COLORS = [
  '124, 91, 245', // purple
  '245, 91, 154', // pink
  '245, 166, 35', // amber
  '52, 211, 153', // green
  '99, 102, 241', // indigo
];

const ATTRACT_DIST = 250;
const REPEL_DIST = 40;
const CONN_DIST = 130;
const TRAIL_MAX = 6;
const FRICTION = 0.985;

/* ── Physics helpers ── */

function applyPointerForce(
  p: Particle,
  mx: number,
  my: number,
  velX: number,
  velY: number,
): void {
  const dx = mx - p.x;
  const dy = my - p.y;
  const dist = Math.hypot(dx, dy);
  if (dist <= 1 || dist >= ATTRACT_DIST) {
    p.opacity += (p.baseOpacity - p.opacity) * 0.04;
    return;
  }

  if (dist < REPEL_DIST) {
    const f = ((REPEL_DIST - dist) / REPEL_DIST) * 0.8;
    p.vx -= (dx / dist) * f + velX * 0.15;
    p.vy -= (dy / dist) * f + velY * 0.15;
  } else {
    const f = ((ATTRACT_DIST - dist) / ATTRACT_DIST) * 0.025;
    p.vx += (dx / dist) * f;
    p.vy += (dy / dist) * f;
    p.vx += (-dy / dist) * f * 0.3;
    p.vy += (dx / dist) * f * 0.3;
  }
  p.opacity = p.baseOpacity + (1 - dist / ATTRACT_DIST) * 0.6;
}

function applyRippleForces(p: Particle, ripples: Ripple[]): void {
  for (const rip of ripples) {
    const rdx = p.x - rip.x;
    const rdy = p.y - rip.y;
    const rdist = Math.hypot(rdx, rdy);
    if (rdist > rip.r - 30 && rdist < rip.r + 30 && rdist > 1) {
      const force = rip.alpha * 2;
      p.vx += (rdx / rdist) * force;
      p.vy += (rdy / rdist) * force;
    }
  }
}

function integrateAndWrap(p: Particle, w: number, h: number): void {
  p.vx *= FRICTION;
  p.vy *= FRICTION;
  p.x += p.vx;
  p.y += p.vy;

  let wrapped = false;
  if (p.x < 0) {
    p.x = w;
    wrapped = true;
  }
  if (p.x > w) {
    p.x = 0;
    wrapped = true;
  }
  if (p.y < 0) {
    p.y = h;
    wrapped = true;
  }
  if (p.y > h) {
    p.y = 0;
    wrapped = true;
  }

  if (wrapped) p.trail = [];
  p.trail.push({ x: p.x, y: p.y });
  if (p.trail.length > TRAIL_MAX) p.trail.shift();
}

/* ── Rendering helpers ── */

function drawTrail(ctx: CanvasRenderingContext2D, p: Particle): void {
  if (p.trail.length < 2) return;
  const speed = Math.hypot(p.vx, p.vy);
  if (speed <= 0.5) return;

  ctx.beginPath();
  ctx.moveTo(p.trail[0].x, p.trail[0].y);
  for (let t = 1; t < p.trail.length; t++) {
    ctx.lineTo(p.trail[t].x, p.trail[t].y);
  }
  ctx.strokeStyle = `rgba(${p.color}, ${Math.min(speed * 0.05, 0.15)})`;
  ctx.lineWidth = p.radius * 0.6;
  ctx.stroke();
}

function drawParticle(ctx: CanvasRenderingContext2D, p: Particle): void {
  ctx.beginPath();
  ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(${p.color}, ${p.opacity})`;
  ctx.fill();
}

function drawConnections(ctx: CanvasRenderingContext2D, pts: Particle[]): void {
  for (let i = 0; i < pts.length; i++) {
    for (let j = i + 1; j < pts.length; j++) {
      const dist = Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y);
      if (dist < CONN_DIST) {
        const alpha = (1 - dist / CONN_DIST) * 0.12;
        ctx.beginPath();
        ctx.moveTo(pts[i].x, pts[i].y);
        ctx.lineTo(pts[j].x, pts[j].y);
        ctx.strokeStyle = `rgba(${pts[i].color}, ${alpha})`;
        ctx.lineWidth = 0.4;
        ctx.stroke();
      }
    }
  }
}

function drawCursorGlow(
  ctx: CanvasRenderingContext2D,
  mx: number,
  my: number,
  w: number,
  h: number,
): void {
  const g = ctx.createRadialGradient(mx, my, 0, mx, my, 220);
  g.addColorStop(0, 'rgba(124, 91, 245, 0.1)');
  g.addColorStop(0.4, 'rgba(245, 91, 154, 0.04)');
  g.addColorStop(1, 'rgba(245, 166, 35, 0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}

function drawAndPruneRipples(
  ctx: CanvasRenderingContext2D,
  ripples: Ripple[],
): void {
  for (let i = ripples.length - 1; i >= 0; i--) {
    const rip = ripples[i];
    rip.r += 6;
    rip.alpha *= 0.94;

    ctx.beginPath();
    ctx.arc(rip.x, rip.y, rip.r, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(124, 91, 245, ${rip.alpha})`;
    ctx.lineWidth = 2;
    ctx.stroke();

    if (rip.alpha < 0.01 || rip.r > rip.maxR) {
      ripples.splice(i, 1);
    }
  }
}

/* ── Component ── */

export default function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);
  const pointer = useRef({ x: -1000, y: -1000, active: false });
  const prevPointer = useRef({ x: -1000, y: -1000 });
  const pointerVel = useRef({ x: 0, y: 0 });
  const ripples = useRef<Ripple[]>([]);
  const animationId = useRef<number>(0);

  const initParticles = useCallback((w: number, h: number) => {
    const count = Math.min(Math.floor((w * h) / 12000), 120);
    particles.current = Array.from({ length: count }, () => {
      const baseOpacity = Math.random() * 0.4 + 0.15;
      return {
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        radius: Math.random() * 2 + 0.5,
        opacity: baseOpacity,
        baseOpacity,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        trail: [],
      };
    });
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const dpr = globalThis.devicePixelRatio || 1;
      const w = parent.clientWidth;
      const h = parent.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      initParticles(w, h);
    };

    resize();
    globalThis.addEventListener('resize', resize);

    const handlePointer = (e: MouseEvent | TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      const cx = 'touches' in e ? (e.touches[0]?.clientX ?? -1000) : e.clientX;
      const cy = 'touches' in e ? (e.touches[0]?.clientY ?? -1000) : e.clientY;
      pointer.current = { x: cx - rect.left, y: cy - rect.top, active: true };
    };

    const handleLeave = () => {
      pointer.current = { x: -1000, y: -1000, active: false };
    };

    const handleClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      ripples.current.push({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        r: 0,
        maxR: 200,
        alpha: 0.6,
      });
    };

    // Listen on the parent (.hero) so events aren't blocked by .hero-inner overlay
    const hero = canvas.parentElement;
    if (!hero) return;

    hero.addEventListener('mousemove', handlePointer);
    hero.addEventListener('touchmove', handlePointer, { passive: true });
    hero.addEventListener('mouseleave', handleLeave);
    hero.addEventListener('touchend', handleLeave);
    hero.addEventListener('click', handleClick);

    const draw = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      ctx.clearRect(0, 0, w, h);

      const pts = particles.current;
      const { x: mx, y: my, active } = pointer.current;

      pointerVel.current.x = mx - prevPointer.current.x;
      pointerVel.current.y = my - prevPointer.current.y;
      prevPointer.current = { x: mx, y: my };

      for (const p of pts) {
        if (active) {
          applyPointerForce(
            p,
            mx,
            my,
            pointerVel.current.x,
            pointerVel.current.y,
          );
        } else {
          p.opacity += (p.baseOpacity - p.opacity) * 0.04;
        }
        applyRippleForces(p, ripples.current);
        integrateAndWrap(p, w, h);
        drawTrail(ctx, p);
        drawParticle(ctx, p);
      }

      drawConnections(ctx, pts);

      if (active && mx > 0 && my > 0) {
        drawCursorGlow(ctx, mx, my, w, h);
      }

      drawAndPruneRipples(ctx, ripples.current);
      animationId.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationId.current);
      globalThis.removeEventListener('resize', resize);
      const heroEl = canvas.parentElement;
      if (heroEl) {
        heroEl.removeEventListener('mousemove', handlePointer);
        heroEl.removeEventListener('touchmove', handlePointer);
        heroEl.removeEventListener('mouseleave', handleLeave);
        heroEl.removeEventListener('touchend', handleLeave);
        heroEl.removeEventListener('click', handleClick);
      }
    };
  }, [initParticles]);

  return (
    <canvas
      ref={canvasRef}
      className="particle-canvas"
      aria-hidden="true"
      tabIndex={-1}
    />
  );
}
