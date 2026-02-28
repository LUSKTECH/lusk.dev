'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

interface Body {
  x: number;
  y: number;
  w: number;
  h: number;
  vx: number;
  vy: number;
  rot: number;
  av: number;
  text: string | null;
  color: string;
  fs: number;
  ff: string;
  fw: string;
  bg: string | null;
  br: number;
}

function collectBodies(): Body[] {
  const bodies: Body[] = [];
  const vh = globalThis.innerHeight;

  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode(node) {
        if (!node.textContent?.trim()) return NodeFilter.FILTER_REJECT;
        const el = node.parentElement;
        if (!el) return NodeFilter.FILTER_REJECT;
        const tag = el.tagName;
        if (
          tag === 'SCRIPT' ||
          tag === 'STYLE' ||
          tag === 'CANVAS' ||
          tag === 'NOSCRIPT'
        )
          return NodeFilter.FILTER_REJECT;
        const s = getComputedStyle(el);
        if (
          s.display === 'none' ||
          s.visibility === 'hidden' ||
          s.opacity === '0'
        )
          return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      },
    },
  );

  let textNode: Node | null;
  while ((textNode = walker.nextNode())) {
    const el = textNode.parentElement;
    if (!el) continue;
    const fullText = textNode.textContent?.trim();
    if (!fullText) continue;

    const parentRect = el.getBoundingClientRect();
    if (parentRect.bottom < 0 || parentRect.top > vh) continue;

    const s = getComputedStyle(el);
    const fs = Number.parseFloat(s.fontSize) || 16;
    const color = s.color;
    const ff = s.fontFamily;
    const fw = s.fontWeight;

    const words = fullText.split(/\s+/).filter(Boolean);
    const nodeText = textNode.textContent || '';
    let searchFrom = 0;

    for (const word of words) {
      const idx = nodeText.indexOf(word, searchFrom);
      if (idx === -1) continue;
      searchFrom = idx + word.length;

      try {
        const range = document.createRange();
        range.setStart(textNode, idx);
        range.setEnd(textNode, idx + word.length);
        const rect = range.getBoundingClientRect();
        if (rect.width < 2 || rect.height < 2) continue;
        if (rect.bottom < 0 || rect.top > vh) continue;

        bodies.push({
          x: rect.left,
          y: rect.top,
          w: rect.width,
          h: rect.height,
          vx: 0,
          vy: 0,
          rot: 0,
          av: (Math.random() - 0.5) * 0.08,
          text: word,
          color,
          fs,
          ff,
          fw,
          bg: null,
          br: 0,
        });
      } catch {
        // Range might fail on some edge cases
      }
    }
  }

  // UI blocks
  const selectors = [
    '.btn-primary',
    '.btn-ghost',
    '.nav-cta',
    '.feature-chip',
    '.card-icon',
    '.hero-badge',
    '.toolbox-cell',
    '.contact-card',
    '.nav-brand',
    '.dot',
    '.project-card',
    '.featured-project',
  ];
  document.querySelectorAll<HTMLElement>(selectors.join(',')).forEach((el) => {
    const rect = el.getBoundingClientRect();
    if (rect.bottom < 0 || rect.top > vh || rect.width < 4) return;
    const s = getComputedStyle(el);
    const bg =
      s.backgroundColor === 'rgba(0, 0, 0, 0)'
        ? 'rgba(255,255,255,0.04)'
        : s.backgroundColor;
    bodies.push({
      x: rect.left,
      y: rect.top,
      w: rect.width,
      h: rect.height,
      vx: 0,
      vy: 0,
      rot: 0,
      av: (Math.random() - 0.5) * 0.04,
      text: null,
      color: s.color,
      fs: 0,
      ff: '',
      fw: '',
      bg,
      br: Number.parseFloat(s.borderRadius) || 0,
    });
  });

  return bodies.slice(0, 300);
}

function runPhysics(bodies: Body[]): Promise<void> {
  return new Promise((resolve) => {
    const dpr = globalThis.devicePixelRatio || 1;
    const W = globalThis.innerWidth;
    const H = globalThis.innerHeight;

    const canvas = document.createElement('canvas');
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    Object.assign(canvas.style, {
      position: 'fixed',
      inset: '0',
      zIndex: '9999',
      width: `${W}px`,
      height: `${H}px`,
      pointerEvents: 'none',
    });
    canvas.setAttribute('aria-hidden', 'true');
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      canvas.remove();
      resolve();
      return;
    }

    const PUSH_FORCE = -80;
    const GRAV_Y = 4;
    const FRICTION = 0.91;
    const BOUNCE = 0.2;
    let frame = 0;
    const SWEEP_FRAMES = 40; // How many frames for the bar to cross the screen
    const LINGER_FRAMES = 10; // Extra frames after bar exits to let things settle
    const MAX = SWEEP_FRAMES + LINGER_FRAMES;
    const BAR_WIDTH = 6;

    function step() {
      ctx!.clearRect(0, 0, W * dpr, H * dpr);
      ctx!.save();
      ctx!.scale(dpr, dpr);

      // ── Sweep bar position (moves right to left) ──
      const barProgress = Math.min(frame / SWEEP_FRAMES, 1);
      // Ease-in-out for the bar movement
      const eased =
        barProgress < 0.5
          ? 2 * barProgress * barProgress
          : 1 - (-2 * barProgress + 2) ** 2 / 2;
      const barX = W * (1 - eased) + BAR_WIDTH;

      // ── Dark background only on the left side of the bar ──
      // This lets the new page show through on the right
      ctx!.fillStyle = '#050508';
      ctx!.fillRect(0, 0, Math.max(barX, 0), H);

      // ── Push bodies that the bar has reached ──
      for (const b of bodies) {
        const bodyCenter = b.x + b.w / 2;

        // If the bar has swept past this body, push it
        if (bodyCenter > barX - 60) {
          // Stronger force the closer to the bar
          const proximity = Math.max(0, 1 - Math.abs(bodyCenter - barX) / 120);
          b.vx += PUSH_FORCE * 0.016 * (0.3 + proximity * 0.7);
          b.vy += GRAV_Y * 0.016 * (Math.random() - 0.4);
        }

        b.vx *= FRICTION;
        b.vy *= FRICTION;
        b.x += b.vx;
        b.y += b.vy;
        b.rot += b.av;
        b.av *= 0.97;

        // Hard collision with the bar — bodies can't pass through it
        if (barProgress < 1 && b.x + b.w > barX) {
          b.x = barX - b.w;
          b.vx = -Math.abs(b.vx) * 0.3;
        }

        // Left wall — pile up
        if (b.x < 0) {
          b.x = Math.random() * 2;
          b.vx = Math.abs(b.vx) * BOUNCE;
          b.av += (Math.random() - 0.5) * 0.12;
        }
        // Floor / ceiling
        if (b.y + b.h > H) {
          b.y = H - b.h;
          b.vy *= -BOUNCE;
        }
        if (b.y < 0) {
          b.y = 0;
          b.vy *= -BOUNCE;
        }

        // Render body
        ctx!.save();
        ctx!.translate(b.x + b.w / 2, b.y + b.h / 2);
        ctx!.rotate(b.rot);

        if (b.text) {
          ctx!.font = `${b.fw} ${b.fs}px ${b.ff}`;
          ctx!.fillStyle = b.color;
          ctx!.textBaseline = 'middle';
          ctx!.textAlign = 'center';
          ctx!.fillText(b.text, 0, 0);
        } else if (b.bg) {
          ctx!.fillStyle = b.bg;
          const r = Math.min(b.br, b.w / 2, b.h / 2);
          ctx!.beginPath();
          ctx!.roundRect(-b.w / 2, -b.h / 2, b.w, b.h, r);
          ctx!.fill();
        }

        ctx!.restore();
      }

      // ── Draw the visible sweep bar ──
      if (barProgress < 1) {
        // Glowing bar
        const grad = ctx!.createLinearGradient(barX - 40, 0, barX + 10, 0);
        grad.addColorStop(0, 'rgba(124, 91, 245, 0)');
        grad.addColorStop(0.5, 'rgba(124, 91, 245, 0.3)');
        grad.addColorStop(0.8, 'rgba(245, 91, 154, 0.6)');
        grad.addColorStop(1, 'rgba(255, 255, 255, 0.9)');
        ctx!.fillStyle = grad;
        ctx!.fillRect(barX - 40, 0, 50, H);

        // Bright edge
        ctx!.fillStyle = 'rgba(255, 255, 255, 0.95)';
        ctx!.fillRect(barX - 1, 0, BAR_WIDTH, H);

        // Glow halo behind the bar
        const halo = ctx!.createLinearGradient(barX, 0, barX + 80, 0);
        halo.addColorStop(0, 'rgba(124, 91, 245, 0.15)');
        halo.addColorStop(1, 'rgba(124, 91, 245, 0)');
        ctx!.fillStyle = halo;
        ctx!.fillRect(barX, 0, 80, H);
      }

      ctx!.restore();
      frame++;

      if (frame < MAX) {
        requestAnimationFrame(step);
      } else {
        canvas.remove();
        resolve();
      }
    }

    requestAnimationFrame(step);
  });
}

/**
 * Intercepts internal link clicks, captures the current page as physics bodies,
 * runs the sweep animation, THEN navigates to the new page.
 */
export default function PageTransition() {
  const router = useRouter();
  const pathname = usePathname();
  const animating = useRef(false);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      // Find the closest <a> tag
      const anchor = (e.target as HTMLElement).closest('a');
      if (!anchor) return;

      const href = anchor.getAttribute('href');
      if (!href) return;

      // Only intercept internal navigation links (not same-page anchors, not external)
      const isExternal =
        anchor.target === '_blank' ||
        anchor.origin !== globalThis.location.origin;
      if (isExternal) return;

      // Skip same-page hash links
      const url = new URL(href, globalThis.location.origin);
      if (url.pathname === pathname && url.hash) return;
      // Skip if navigating to the same page
      if (url.pathname === pathname) return;

      // Don't double-fire
      if (animating.current) return;

      // Skip if user prefers reduced motion
      if (globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches)
        return;

      // Intercept the navigation
      e.preventDefault();
      e.stopPropagation();
      animating.current = true;

      // Capture the CURRENT page's bodies before React swaps anything
      const bodies = collectBodies();

      if (bodies.length === 0) {
        router.push(href);
        animating.current = false;
        return;
      }

      // Start physics, navigate mid-animation so new page loads behind canvas
      const physicsPromise = runPhysics(bodies);

      // Push the route after a short delay so the new page renders behind the canvas
      setTimeout(() => {
        router.push(href);
      }, 400);

      physicsPromise.then(() => {
        animating.current = false;
      });
    };

    // Capture phase so we intercept before Next.js Link handler
    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, [pathname, router]);

  return null;
}
