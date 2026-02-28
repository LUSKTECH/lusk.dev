// @vitest-environment jsdom

/**
 * Additional PageTransition tests targeting uncovered lines:
 * - Lines 250-251: floor collision (b.y + b.h > H)
 * - Lines 260-264: ceiling collision (b.y < 0)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';

const mockPush = vi.fn();
let mockPathname = '/';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => mockPathname,
}));

import PageTransition from '@/components/PageTransition';

let container: HTMLDivElement;
let root: Root;

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  mockPush.mockClear();
  mockPathname = '/';

  Object.defineProperty(globalThis, 'matchMedia', {
    value: vi.fn().mockReturnValue({ matches: false }),
    writable: true,
    configurable: true,
  });
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  vi.restoreAllMocks();
});

describe('PageTransition physics boundary coverage', () => {
  it('handles bodies that exceed floor and ceiling boundaries during physics', async () => {
    const mockCtx = {
      clearRect: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      scale: vi.fn(),
      fillRect: vi.fn(),
      fillText: vi.fn(),
      beginPath: vi.fn(),
      roundRect: vi.fn(),
      fill: vi.fn(),
      rotate: vi.fn(),
      translate: vi.fn(),
      createLinearGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
      fillStyle: '',
      font: '',
      textBaseline: '',
      textAlign: '',
    };
    HTMLCanvasElement.prototype.getContext = vi.fn(
      () => mockCtx,
    ) as unknown as typeof HTMLCanvasElement.prototype.getContext;

    const rafCallbacks: FrameRequestCallback[] = [];
    vi.spyOn(globalThis, 'requestAnimationFrame').mockImplementation((cb) => {
      rafCallbacks.push(cb);
      return rafCallbacks.length;
    });

    vi.useFakeTimers();

    // Set a small viewport so bodies easily go out of bounds
    Object.defineProperty(globalThis, 'innerHeight', {
      value: 100,
      configurable: true,
    });
    Object.defineProperty(globalThis, 'innerWidth', {
      value: 200,
      configurable: true,
    });

    await act(async () => {
      root.render(<PageTransition />);
    });

    const link = document.createElement('a');
    link.setAttribute('href', '/test');
    document.body.appendChild(link);

    // Create elements positioned at extremes to trigger floor/ceiling collisions
    // Element near the bottom edge — will be pushed down past floor
    const bottomEl = document.createElement('div');
    bottomEl.className = 'project-card';
    bottomEl.textContent = 'Bottom';
    bottomEl.getBoundingClientRect = () => ({
      top: 90,
      bottom: 110,
      left: 50,
      right: 150,
      width: 100,
      height: 20,
      x: 50,
      y: 90,
      toJSON: () => {},
    });
    document.body.appendChild(bottomEl);

    // Element near the top edge — will be pushed up past ceiling
    const topEl = document.createElement('div');
    topEl.className = 'feature-chip';
    topEl.textContent = 'Top';
    topEl.getBoundingClientRect = () => ({
      top: 2,
      bottom: 12,
      left: 10,
      right: 110,
      width: 100,
      height: 10,
      x: 10,
      y: 2,
      toJSON: () => {},
    });
    document.body.appendChild(topEl);

    await act(async () => {
      const event = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
      });
      link.dispatchEvent(event);
    });

    // Run enough frames for the sweep bar to push bodies into boundaries
    for (let i = 0; i < 55; i++) {
      const cb = rafCallbacks.shift();
      if (cb) cb(i * 16);
    }

    await act(async () => {
      vi.advanceTimersByTime(500);
    });

    expect(mockPush).toHaveBeenCalledWith('/test');

    link.remove();
    bottomEl.remove();
    topEl.remove();
    vi.useRealTimers();
  });
});
