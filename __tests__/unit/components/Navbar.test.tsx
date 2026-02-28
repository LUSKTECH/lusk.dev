// @vitest-environment jsdom

import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import Navbar from '@/components/Navbar';

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

describe('Navbar', () => {
  it('renders a nav element with main navigation label', () => {
    const html = renderToStaticMarkup(<Navbar />);
    expect(html).toContain('role="navigation"');
    expect(html).toContain('aria-label="Main navigation"');
  });

  it('renders the brand link to home', () => {
    const html = renderToStaticMarkup(<Navbar />);
    expect(html).toContain('href="/"');
    expect(html).toContain('lusk.dev');
  });

  it('renders Projects link pointing to /#projects', () => {
    const html = renderToStaticMarkup(<Navbar />);
    expect(html).toContain('href="/#projects"');
    expect(html).toContain('Projects');
  });

  it('renders Toolbox link pointing to /#toolbox', () => {
    const html = renderToStaticMarkup(<Navbar />);
    expect(html).toContain('href="/#toolbox"');
    expect(html).toContain('Toolbox');
  });

  it('renders Say Hello link pointing to /#contact', () => {
    const html = renderToStaticMarkup(<Navbar />);
    expect(html).toContain('href="/#contact"');
    expect(html).toContain('Say Hello');
  });

  it('renders the green dot indicator', () => {
    const html = renderToStaticMarkup(<Navbar />);
    expect(html).toContain('class="dot"');
    expect(html).toContain('aria-hidden="true"');
  });
});
