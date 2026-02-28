// @vitest-environment jsdom

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

  // Mock matchMedia for reduced motion check
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

describe('PageTransition', () => {
  it('renders null (no visible DOM output)', async () => {
    await act(async () => {
      root.render(<PageTransition />);
    });

    // PageTransition returns null, so container should have no child elements
    expect(container.children.length).toBe(0);
  });

  it('does not intercept external links', async () => {
    await act(async () => {
      root.render(<PageTransition />);
    });

    const link = document.createElement('a');
    link.href = 'https://external.com/page';
    link.target = '_blank';
    document.body.appendChild(link);

    const event = new MouseEvent('click', { bubbles: true });
    link.dispatchEvent(event);

    expect(mockPush).not.toHaveBeenCalled();
    link.remove();
  });

  it('does not intercept same-page hash links', async () => {
    await act(async () => {
      root.render(<PageTransition />);
    });

    const link = document.createElement('a');
    link.setAttribute('href', '/#section');
    document.body.appendChild(link);

    const event = new MouseEvent('click', { bubbles: true });
    link.dispatchEvent(event);

    expect(mockPush).not.toHaveBeenCalled();
    link.remove();
  });

  it('does not intercept links to the same pathname', async () => {
    mockPathname = '/about';

    await act(async () => {
      root.render(<PageTransition />);
    });

    const link = document.createElement('a');
    link.setAttribute('href', '/about');
    document.body.appendChild(link);

    const event = new MouseEvent('click', { bubbles: true });
    link.dispatchEvent(event);

    expect(mockPush).not.toHaveBeenCalled();
    link.remove();
  });

  it('skips animation when prefers-reduced-motion is set', async () => {
    Object.defineProperty(globalThis, 'matchMedia', {
      value: vi.fn().mockReturnValue({ matches: true }),
      writable: true,
      configurable: true,
    });

    await act(async () => {
      root.render(<PageTransition />);
    });

    const link = document.createElement('a');
    link.setAttribute('href', '/about');
    document.body.appendChild(link);

    const event = new MouseEvent('click', { bubbles: true });
    link.dispatchEvent(event);

    // Should not intercept when reduced motion is preferred
    expect(mockPush).not.toHaveBeenCalled();
    link.remove();
  });

  it('intercepts internal navigation links and runs physics animation', async () => {
    // Mock canvas context for the physics animation
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
      createLinearGradient: vi.fn(() => ({
        addColorStop: vi.fn(),
      })),
      fillStyle: '',
      font: '',
      textBaseline: '',
      textAlign: '',
    };
    HTMLCanvasElement.prototype.getContext = vi.fn(
      () => mockCtx,
    ) as unknown as typeof HTMLCanvasElement.prototype.getContext;

    // Track all rAF callbacks so we can run the full animation
    const rafCallbacks: FrameRequestCallback[] = [];
    vi.spyOn(globalThis, 'requestAnimationFrame').mockImplementation((cb) => {
      rafCallbacks.push(cb);
      return rafCallbacks.length;
    });

    vi.useFakeTimers();

    await act(async () => {
      root.render(<PageTransition />);
    });

    // Create an internal link
    const link = document.createElement('a');
    link.setAttribute('href', '/about');
    document.body.appendChild(link);

    // Create elements that collectBodies will find via UI selectors
    const card = document.createElement('div');
    card.className = 'project-card';
    card.textContent = 'Test Card';
    // Mock getBoundingClientRect to return visible dimensions
    card.getBoundingClientRect = () => ({
      top: 100,
      bottom: 200,
      left: 50,
      right: 250,
      width: 200,
      height: 100,
      x: 50,
      y: 100,
      toJSON: () => {},
    });
    document.body.appendChild(card);

    const chip = document.createElement('span');
    chip.className = 'feature-chip';
    chip.textContent = 'Test';
    chip.getBoundingClientRect = () => ({
      top: 50,
      bottom: 80,
      left: 10,
      right: 110,
      width: 100,
      height: 30,
      x: 10,
      y: 50,
      toJSON: () => {},
    });
    document.body.appendChild(chip);

    // Add a text node with mocked range
    const textEl = document.createElement('p');
    textEl.style.display = 'block';
    textEl.style.fontSize = '16px';
    textEl.textContent = 'Hello World';
    document.body.appendChild(textEl);

    // Mock innerHeight/innerWidth
    Object.defineProperty(globalThis, 'innerHeight', {
      value: 800,
      configurable: true,
    });
    Object.defineProperty(globalThis, 'innerWidth', {
      value: 1024,
      configurable: true,
    });

    await act(async () => {
      const event = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
      });
      link.dispatchEvent(event);
    });

    // Run all animation frames until completion (MAX = 50 frames)
    for (let i = 0; i < 55; i++) {
      const cb = rafCallbacks.shift();
      if (cb) cb(i * 16);
    }

    // Run the setTimeout that triggers router.push
    await act(async () => {
      vi.advanceTimersByTime(500);
    });

    expect(mockPush).toHaveBeenCalledWith('/about');

    link.remove();
    card.remove();
    chip.remove();
    textEl.remove();
    vi.useRealTimers();
  });

  it('navigates immediately when no bodies are collected', async () => {
    await act(async () => {
      root.render(<PageTransition />);
    });

    // Remove all text content from body so collectBodies returns empty
    const originalChildren = Array.from(document.body.children).filter(
      (el) => el !== container,
    );
    for (const child of originalChildren) {
      child.remove();
    }

    const link = document.createElement('a');
    link.setAttribute('href', '/contact');
    document.body.appendChild(link);

    await act(async () => {
      const event = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
      });
      link.dispatchEvent(event);
    });

    expect(mockPush).toHaveBeenCalledWith('/contact');
    link.remove();
  });

  it('does not intercept clicks on non-anchor elements', async () => {
    await act(async () => {
      root.render(<PageTransition />);
    });

    const button = document.createElement('button');
    button.textContent = 'Click me';
    document.body.appendChild(button);

    const event = new MouseEvent('click', { bubbles: true });
    button.dispatchEvent(event);

    expect(mockPush).not.toHaveBeenCalled();
    button.remove();
  });
});
