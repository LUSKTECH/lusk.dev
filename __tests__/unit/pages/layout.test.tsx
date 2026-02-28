// @vitest-environment jsdom

import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    ...rest
  }: {
    href: string;
    children: React.ReactNode;
  }) => React.createElement('a', { href, ...rest }, children),
}));

vi.mock('@/components/Footer', () => ({
  default: () =>
    React.createElement('footer', { 'data-testid': 'footer' }, 'Footer'),
}));

vi.mock('@/components/PageTransition', () => ({
  default: () => null,
}));

import RootLayout, { metadata } from '@/app/layout';

describe('RootLayout', () => {
  it('renders html with lang="en"', () => {
    const html = renderToStaticMarkup(
      <RootLayout>
        <div>Test child</div>
      </RootLayout>,
    );
    expect(html).toContain('lang="en"');
  });

  it('renders children', () => {
    const html = renderToStaticMarkup(
      <RootLayout>
        <div>Test child content</div>
      </RootLayout>,
    );
    expect(html).toContain('Test child content');
  });

  it('renders Footer component', () => {
    const html = renderToStaticMarkup(
      <RootLayout>
        <div>child</div>
      </RootLayout>,
    );
    expect(html).toContain('Footer');
  });

  it('renders JSON-LD script tag', () => {
    const html = renderToStaticMarkup(
      <RootLayout>
        <div>child</div>
      </RootLayout>,
    );
    expect(html).toContain('application/ld+json');
    expect(html).toContain('Organization');
  });
});

describe('RootLayout metadata', () => {
  it('has a default title', () => {
    expect(metadata.title).toBeDefined();
  });

  it('has a description', () => {
    expect(metadata.description).toBeDefined();
    expect(typeof metadata.description).toBe('string');
  });

  it('has openGraph configuration', () => {
    expect(metadata.openGraph).toBeDefined();
  });

  it('has twitter card configuration', () => {
    expect(metadata.twitter).toBeDefined();
  });
});
