// @vitest-environment jsdom

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import ParticleBackground from '@/components/ParticleBackground';

let container: HTMLDivElement;
let root: Root;
let rafCallbacks: FrameRequestCallback[];

// Mock canvas context
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
  createRadialGradient: vi.fn(() => ({
    addColorStop: vi.fn(),
  })),
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

beforeEach(() => {
  container = document.createElement('div');
  // Give the container dimensions so the component can read them
  Object.defineProperty(container, 'clientWidth', {
    value: 800,
    configurable: true,
  });
  Object.defineProperty(container, 'clientHeight', {
    value: 600,
    configurable: true,
  });
  document.body.appendChild(container);
  root = createRoot(container);

  // Reset mock call counts
  for (const fn of Object.values(mockCtx)) {
    if (typeof fn === 'function' && 'mockClear' in fn) {
      (fn as ReturnType<typeof vi.fn>).mockClear();
    }
  }
  mockCtx.createRadialGradient = vi.fn(() => ({
    addColorStop: vi.fn(),
  }));

  // Mock canvas getContext
  HTMLCanvasElement.prototype.getContext = vi.fn(
    () => mockCtx,
  ) as unknown as typeof HTMLCanvasElement.prototype.getContext;

  // Collect rAF callbacks — run the first one immediately, store the rest
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

describe('ParticleBackground', () => {
  it('renders a canvas element', async () => {
    await act(async () => {
      root.render(<ParticleBackground />);
    });

    const canvas = container.querySelector('canvas');
    expect(canvas).not.toBeNull();
  });

  it('canvas has aria-hidden attribute', async () => {
    await act(async () => {
      root.render(<ParticleBackground />);
    });

    const canvas = container.querySelector('canvas');
    expect(canvas?.getAttribute('aria-hidden')).toBe('true');
  });

  it('canvas has tabIndex -1', async () => {
    await act(async () => {
      root.render(<ParticleBackground />);
    });

    const canvas = container.querySelector('canvas');
    expect(canvas?.getAttribute('tabindex')).toBe('-1');
  });

  it('initializes canvas context on mount', async () => {
    await act(async () => {
      root.render(<ParticleBackground />);
    });

    expect(HTMLCanvasElement.prototype.getContext).toHaveBeenCalledWith('2d');
  });

  it('runs the draw loop and renders particles', async () => {
    await act(async () => {
      root.render(<ParticleBackground />);
    });

    // The draw loop should have called canvas methods
    expect(mockCtx.clearRect).toHaveBeenCalled();
    expect(mockCtx.beginPath).toHaveBeenCalled();
    expect(mockCtx.arc).toHaveBeenCalled();
    expect(mockCtx.fill).toHaveBeenCalled();
  });

  it('responds to mousemove events on parent', async () => {
    await act(async () => {
      root.render(<ParticleBackground />);
    });

    // Simulate mousemove on the container (parent of canvas)
    const moveEvent = new MouseEvent('mousemove', {
      clientX: 100,
      clientY: 200,
      bubbles: true,
    });
    container.dispatchEvent(moveEvent);

    // Run another animation frame to process the pointer
    const cb = rafCallbacks.shift();
    if (cb) cb(16);

    // Should have drawn cursor glow (createRadialGradient)
    expect(mockCtx.createRadialGradient).toHaveBeenCalled();
  });

  it('responds to mouseleave events', async () => {
    await act(async () => {
      root.render(<ParticleBackground />);
    });

    // First move the mouse in
    container.dispatchEvent(
      new MouseEvent('mousemove', {
        clientX: 100,
        clientY: 200,
        bubbles: true,
      }),
    );

    // Then leave
    container.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));

    // Run another frame
    const cb = rafCallbacks.shift();
    if (cb) cb(32);

    // Should still render without errors
    expect(mockCtx.clearRect).toHaveBeenCalled();
  });

  it('handles click events to create ripples', async () => {
    await act(async () => {
      root.render(<ParticleBackground />);
    });

    // Click on the container
    container.dispatchEvent(
      new MouseEvent('click', { clientX: 150, clientY: 250, bubbles: true }),
    );

    // Run animation frame to draw ripples
    const cb = rafCallbacks.shift();
    if (cb) cb(48);

    // Ripple drawing uses arc and stroke
    expect(mockCtx.stroke).toHaveBeenCalled();
  });

  it('handles resize events', async () => {
    await act(async () => {
      root.render(<ParticleBackground />);
    });

    // Trigger resize
    globalThis.dispatchEvent(new Event('resize'));

    expect(mockCtx.setTransform).toHaveBeenCalled();
  });
});
