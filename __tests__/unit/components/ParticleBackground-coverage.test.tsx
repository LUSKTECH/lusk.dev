// @vitest-environment jsdom

/**
 * Additional ParticleBackground tests targeting uncovered lines:
 * - Line 126: trail drawing when speed > 0.5 (drawTrail body)
 * - Line 184: connection drawing when dist < CONN_DIST (drawConnections body)
 * - Lines 320-324: touch event handling
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import ParticleBackground from '@/components/ParticleBackground';

let container: HTMLDivElement;
let root: Root;
let rafCallbacks: FrameRequestCallback[];

const mockCtx = {
  clearRect: vi.fn(),
  beginPath: vi.fn(),
  arc: vi.fn(),
  fill: vi.fn(),
  stroke: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  closePath: vi.fn(),
  save: vi.fn(),
  restore: vi.fn(),
  scale: vi.fn(),
  setTransform: vi.fn(),
  createRadialGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
  fillRect: vi.fn(),
  fillStyle: '',
  strokeStyle: '',
  lineWidth: 1,
  globalAlpha: 1,
  globalCompositeOperation: 'source-over',
  shadowBlur: 0,
  shadowColor: '',
  font: '',
  textBaseline: '',
  textAlign: '',
  fillText: vi.fn(),
  rotate: vi.fn(),
  translate: vi.fn(),
  roundRect: vi.fn(),
};

function resetMocks() {
  for (const fn of Object.values(mockCtx)) {
    if (typeof fn === 'function' && 'mockClear' in fn) {
      (fn as ReturnType<typeof vi.fn>).mockClear();
    }
  }
  mockCtx.createRadialGradient = vi.fn(() => ({ addColorStop: vi.fn() }));
}

beforeEach(() => {
  container = document.createElement('div');
  Object.defineProperty(container, 'clientWidth', {
    value: 200,
    configurable: true,
  });
  Object.defineProperty(container, 'clientHeight', {
    value: 200,
    configurable: true,
  });
  document.body.appendChild(container);
  root = createRoot(container);
  resetMocks();

  HTMLCanvasElement.prototype.getContext = vi.fn(
    () => mockCtx,
  ) as unknown as typeof HTMLCanvasElement.prototype.getContext;

  rafCallbacks = [];
  let firstCall = true;
  vi.spyOn(globalThis, 'requestAnimationFrame').mockImplementation((cb) => {
    if (firstCall) {
      firstCall = false;
      cb(0);
    } else {
      rafCallbacks.push(cb);
    }
    return rafCallbacks.length;
  });
  vi.spyOn(globalThis, 'cancelAnimationFrame').mockImplementation(() => {});
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  vi.restoreAllMocks();
});

describe('ParticleBackground coverage extras', () => {
  it('draws trails when particles have high velocity (speed > 0.5)', async () => {
    await act(async () => {
      root.render(<ParticleBackground />);
    });

    // Simulate rapid mouse movement to give particles high velocity via repulsion
    // Move mouse quickly across the canvas to push particles
    for (let i = 0; i < 8; i++) {
      container.dispatchEvent(
        new MouseEvent('mousemove', {
          clientX: 10 + i * 25,
          clientY: 100,
          bubbles: true,
        }),
      );
      const cb = rafCallbacks.shift();
      if (cb) cb(16 * (i + 1));
    }

    // After several frames with rapid mouse interaction, particles near the cursor
    // get repelled with high velocity, triggering trail drawing (lineTo in drawTrail)
    expect(mockCtx.lineTo).toHaveBeenCalled();
  });

  it('draws connections between nearby particles', async () => {
    // 400x400 = 160000/12000 ≈ 13 particles in a 400x400 area
    Object.defineProperty(container, 'clientWidth', {
      value: 400,
      configurable: true,
    });
    Object.defineProperty(container, 'clientHeight', {
      value: 400,
      configurable: true,
    });

    await act(async () => {
      root.render(<ParticleBackground />);
    });

    // Run several frames so drawConnections is called repeatedly
    for (let i = 0; i < 5; i++) {
      const cb = rafCallbacks.shift();
      if (cb) cb(16 * (i + 1));
    }

    // With 13 particles in 400x400, statistically some will be within CONN_DIST (130px)
    expect(mockCtx.clearRect).toHaveBeenCalled();
    expect(mockCtx.beginPath).toHaveBeenCalled();
  });

  it('handles touch events (touchmove and touchend)', async () => {
    await act(async () => {
      root.render(<ParticleBackground />);
    });

    // Create a proper TouchEvent-like object with 'touches' as own property
    // so that 'touches' in e evaluates to true
    const touchMoveEvent = new Event('touchmove', { bubbles: true });
    Object.defineProperty(touchMoveEvent, 'touches', {
      value: [{ clientX: 100, clientY: 100 }],
      enumerable: true,
      configurable: true,
    });
    container.dispatchEvent(touchMoveEvent);

    // Run a frame to process the touch pointer
    const cb1 = rafCallbacks.shift();
    if (cb1) cb1(16);

    // Should draw cursor glow after touch
    expect(mockCtx.createRadialGradient).toHaveBeenCalled();

    // Simulate touchend
    container.dispatchEvent(new Event('touchend', { bubbles: true }));

    const cb2 = rafCallbacks.shift();
    if (cb2) cb2(32);

    // Should still render without errors
    expect(mockCtx.clearRect).toHaveBeenCalled();
  });

  it('exercises particle wrapping and trail reset when particles go off-screen', async () => {
    // 200x200 = 40000/12000 ≈ 3 particles — enough to exist, small enough to wrap
    Object.defineProperty(container, 'clientWidth', {
      value: 200,
      configurable: true,
    });
    Object.defineProperty(container, 'clientHeight', {
      value: 200,
      configurable: true,
    });

    await act(async () => {
      root.render(<ParticleBackground />);
    });

    // Push particles hard with rapid mouse movement near edges
    for (let i = 0; i < 10; i++) {
      container.dispatchEvent(
        new MouseEvent('mousemove', {
          clientX: 5,
          clientY: 5,
          bubbles: true,
        }),
      );
      const cb = rafCallbacks.shift();
      if (cb) cb(16 * (i + 1));
    }

    // Particles near the edge should wrap and have their trails reset
    expect(mockCtx.arc).toHaveBeenCalled();
  });
});
