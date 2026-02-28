// @vitest-environment jsdom

import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import Home from '@/app/page';

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
  default: () => React.createElement('canvas', { 'data-testid': 'particles' }),
}));

describe('Home page', () => {
  it('renders the hero section with heading', () => {
    const html = renderToStaticMarkup(<Home />);
    expect(html).toContain('Tools that make');
    expect(html).toContain('WordPress work harder');
  });

  it('renders the hero description mentioning Cody and Lusk Technologies', () => {
    const html = renderToStaticMarkup(<Home />);
    expect(html).toContain('Cody');
    expect(html).toContain('Lusk Technologies');
  });

  it('renders Browse Projects and GitHub CTA buttons', () => {
    const html = renderToStaticMarkup(<Home />);
    expect(html).toContain('Browse Projects');
    expect(html).toContain('GitHub @lusky3');
  });

  it('renders the featured project section', () => {
    const html = renderToStaticMarkup(<Home />);
    expect(html).toContain('Bulk Plugin Installer');
    expect(html).toContain('Flagship Project');
  });

  it('renders the project cards grid', () => {
    const html = renderToStaticMarkup(<Home />);
    expect(html).toContain('Play Store MCP');
    expect(html).toContain('Dockwatch Agent');
    expect(html).toContain('transfer.sh Web');
  });

  it('renders the toolbox section', () => {
    const html = renderToStaticMarkup(<Home />);
    expect(html).toContain('What I work with');
    expect(html).toContain('WordPress');
    expect(html).toContain('Docker');
    expect(html).toContain('TypeScript');
  });

  it('renders the contact section with email', () => {
    const html = renderToStaticMarkup(<Home />);
    expect(html).toContain('hello@lusk.dev');
    expect(html).toContain('Let');
    expect(html).toContain('build something');
  });

  it('renders the open source badge', () => {
    const html = renderToStaticMarkup(<Home />);
    expect(html).toContain('Open source');
    expect(html).toContain('Always free');
  });
});
