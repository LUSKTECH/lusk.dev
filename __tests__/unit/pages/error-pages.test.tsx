// @vitest-environment jsdom

import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import NotFound from '@/app/not-found';
import ErrorPage from '@/app/error';

vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) =>
    React.createElement('a', { href }, children),
}));

function parseHTML(html: string): Document {
  return new DOMParser().parseFromString(html, 'text/html');
}

describe('NotFound (404) page', () => {
  it('renders a 404 heading', () => {
    const html = renderToStaticMarkup(<NotFound />);
    const doc = parseHTML(html);
    const h1 = doc.querySelector('h1');
    expect(h1).not.toBeNull();
    expect(h1!.textContent).toContain('404');
  });

  it('renders a link back to home', () => {
    const html = renderToStaticMarkup(<NotFound />);
    const doc = parseHTML(html);
    const link = doc.querySelector('a[href="/"]');
    expect(link).not.toBeNull();
    expect(link!.textContent).toMatch(/return to home/i);
  });

  it('displays a user-friendly message', () => {
    const html = renderToStaticMarkup(<NotFound />);
    expect(html).toContain('does not exist');
  });
});

describe('ErrorPage (500) page', () => {
  const mockError = new Error('Test error') as Error & { digest?: string };

  it('renders a 500 heading', () => {
    const html = renderToStaticMarkup(
      <ErrorPage error={mockError} reset={() => {}} />,
    );
    const doc = parseHTML(html);
    const h1 = doc.querySelector('h1');
    expect(h1).not.toBeNull();
    expect(h1!.textContent).toContain('500');
  });

  it('renders a link back to home', () => {
    const html = renderToStaticMarkup(
      <ErrorPage error={mockError} reset={() => {}} />,
    );
    const doc = parseHTML(html);
    const link = doc.querySelector('a[href="/"]');
    expect(link).not.toBeNull();
    expect(link!.textContent).toMatch(/return to home/i);
  });

  it('renders a try again button', () => {
    const html = renderToStaticMarkup(
      <ErrorPage error={mockError} reset={() => {}} />,
    );
    const doc = parseHTML(html);
    const button = doc.querySelector('button');
    expect(button).not.toBeNull();
    expect(button!.textContent).toMatch(/try again/i);
  });

  it('displays a user-friendly error message', () => {
    const html = renderToStaticMarkup(
      <ErrorPage error={mockError} reset={() => {}} />,
    );
    expect(html).toContain('unexpected error');
  });
});
