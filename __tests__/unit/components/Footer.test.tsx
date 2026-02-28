// @vitest-environment jsdom

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import Footer from '@/components/Footer';

vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    ...rest
  }: {
    href: string;
    children: React.ReactNode;
    style?: React.CSSProperties;
  }) => React.createElement('a', { href, ...rest }, children),
}));

let container: HTMLDivElement;
let root: Root;

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  localStorage.clear();
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

describe('Footer', () => {
  it('renders footer navigation with correct links', async () => {
    await act(async () => {
      root.render(<Footer />);
    });

    const nav = container.querySelector('nav[aria-label="Footer navigation"]');
    expect(nav).not.toBeNull();

    const links = container.querySelectorAll('a');
    const hrefs = Array.from(links).map((a) => a.getAttribute('href'));
    expect(hrefs).toContain('https://github.com/lusky3');
    expect(hrefs).toContain('mailto:hello@lusk.dev');
    expect(hrefs).toContain('/privacy');
    expect(hrefs).toContain('/terms');
  });

  it('renders copyright text with current year', async () => {
    await act(async () => {
      root.render(<Footer />);
    });

    const year = new Date().getFullYear().toString();
    expect(container.textContent).toContain(year);
    expect(container.textContent).toContain('Lusk Technologies, Inc.');
  });

  it('renders a Cookies button that opens preferences modal', async () => {
    await act(async () => {
      root.render(<Footer />);
    });

    const cookiesBtn = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent === 'Cookies',
    );
    expect(cookiesBtn).toBeDefined();

    // Modal should not be visible initially
    expect(container.querySelector('[style*="position: fixed"]')).toBeNull();

    await act(async () => {
      cookiesBtn!.click();
    });

    // After clicking, the preferences overlay should appear
    const overlay = container.querySelector('[style*="position: fixed"]');
    expect(overlay).not.toBeNull();
  });

  it('closes preferences modal when onPreferencesChange fires', async () => {
    await act(async () => {
      root.render(<Footer />);
    });

    // Open the modal
    const cookiesBtn = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent === 'Cookies',
    );
    await act(async () => {
      cookiesBtn!.click();
    });

    // Modal should be visible
    expect(
      container.querySelector('[style*="position: fixed"]'),
    ).not.toBeNull();

    // Click the Save button inside CookiePreferences to trigger onPreferencesChange
    const saveBtn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Save'),
    );
    if (saveBtn) {
      await act(async () => {
        saveBtn.click();
      });

      // Modal should close
      expect(container.querySelector('[style*="position: fixed"]')).toBeNull();
    }
  });

  it('GitHub link opens in new tab', async () => {
    await act(async () => {
      root.render(<Footer />);
    });

    const ghLink = container.querySelector(
      'a[href="https://github.com/lusky3"]',
    );
    expect(ghLink?.getAttribute('target')).toBe('_blank');
    expect(ghLink?.getAttribute('rel')).toContain('noopener');
  });
});
