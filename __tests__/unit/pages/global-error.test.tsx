// @vitest-environment jsdom

import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

// Mock Sentry before importing the component
vi.mock('@sentry/nextjs', () => ({
  captureException: vi.fn(),
}));

// Mock next/error
vi.mock('next/error', () => ({
  default: ({ statusCode }: { statusCode: number }) =>
    React.createElement('div', { 'data-status': statusCode }, 'Error'),
}));

import GlobalError from '@/app/global-error';

describe('GlobalError page', () => {
  it('renders an html element with body', () => {
    const error = new Error('test') as Error & { digest?: string };
    const html = renderToStaticMarkup(<GlobalError error={error} />);
    expect(html).toContain('<html');
    expect(html).toContain('<body');
  });

  it('renders NextError with statusCode 0', () => {
    const error = new Error('test') as Error & { digest?: string };
    const html = renderToStaticMarkup(<GlobalError error={error} />);
    expect(html).toContain('data-status="0"');
  });
});
