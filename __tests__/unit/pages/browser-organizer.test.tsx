// @vitest-environment jsdom

import { describe, it, expect, vi, beforeAll } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import BrowserOrganizerPage from '@/app/browser-organizer/page';

vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    ...rest
  }: {
    href: string;
    children: React.ReactNode;
    className?: string;
  }) => React.createElement('a', { href, ...rest }, children),
}));

vi.mock('@/components/Navbar', () => ({
  default: () => React.createElement('nav', { 'data-testid': 'navbar' }),
}));

vi.mock('@/components/ParticleBackground', () => ({
  default: () => React.createElement('div', { 'data-testid': 'particles' }),
}));

describe('Browser Organizer landing page', () => {
  let html: string;
  beforeAll(() => {
    html = renderToStaticMarkup(<BrowserOrganizerPage />);
  });

  it('renders the product name and hero', () => {
    expect(html).toContain('Browser Organizer');
    expect(html).toContain('sorted by your own AI');
  });

  it('renders the feature, backend, and install sections', () => {
    expect(html).toContain('What it does');
    expect(html).toContain('Bring your own AI');
    expect(html).toContain('Up and running in minutes');
  });

  it('shows the screenshots gallery', () => {
    expect(html).toContain('A look inside the panel');
    expect(html).toContain('Analyze once, get named tab groups you approve.');
    expect(html).toContain(
      'Pick a backend and toggle exactly what it touches.',
    );
  });

  it('shows the install command', () => {
    expect(html).toContain('npx @lusktech/browser-organizer-host');
  });

  it('lists AI backends', () => {
    expect(html).toContain('Claude Code');
    expect(html).toContain('Ollama');
    expect(html).toContain('OpenAI API');
  });

  it('links to the repo, npm package, and privacy policy', () => {
    expect(html).toContain('github.com/LUSKTECH/browser-organizer');
    expect(html).toContain(
      'npmjs.com/package/@lusktech/browser-organizer-host',
    );
    expect(html).toContain('href="/browser-organizer/privacy"');
  });
});
