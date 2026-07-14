// @vitest-environment jsdom

import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import BrowserOrganizerPrivacyPage from '@/app/browser-organizer/privacy/page';

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

describe('Browser Organizer privacy page', () => {
  it('renders the heading', () => {
    const html = renderToStaticMarkup(<BrowserOrganizerPrivacyPage />);
    expect(html).toContain('Browser Organizer');
    expect(html).toContain('Privacy Policy');
  });

  it('renders the back to home link', () => {
    const html = renderToStaticMarkup(<BrowserOrganizerPrivacyPage />);
    expect(html).toContain('href="/"');
    expect(html).toContain('Back to home');
  });

  it('renders key sections', () => {
    const html = renderToStaticMarkup(<BrowserOrganizerPrivacyPage />);
    expect(html).toContain('What the extension accesses');
    expect(html).toContain('What is sent to your AI provider');
    expect(html).toContain('What stays on your device');
    expect(html).toContain('What we never do');
    expect(html).toContain('Contact');
  });

  it('renders the contact email', () => {
    const html = renderToStaticMarkup(<BrowserOrganizerPrivacyPage />);
    expect(html).toContain('hello@lusk.dev');
  });

  it('links to the main privacy and terms pages', () => {
    const html = renderToStaticMarkup(<BrowserOrganizerPrivacyPage />);
    expect(html).toContain('href="/privacy"');
    expect(html).toContain('href="/terms"');
  });
});
