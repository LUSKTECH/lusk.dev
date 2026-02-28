// @vitest-environment jsdom

import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import PrivacyPolicyPage from '@/app/privacy/page';
import TermsOfServicePage from '@/app/terms/page';

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

describe('Privacy Policy page', () => {
  it('renders the Privacy Policy heading', () => {
    const html = renderToStaticMarkup(<PrivacyPolicyPage />);
    expect(html).toContain('Privacy Policy');
  });

  it('renders the back to home link', () => {
    const html = renderToStaticMarkup(<PrivacyPolicyPage />);
    expect(html).toContain('href="/"');
    expect(html).toContain('Back to home');
  });

  it('renders key sections', () => {
    const html = renderToStaticMarkup(<PrivacyPolicyPage />);
    expect(html).toContain('Data Collection');
    expect(html).toContain('Data Usage');
    expect(html).toContain('Third-Party Sharing');
    expect(html).toContain('Your Rights');
    expect(html).toContain('Contact');
  });

  it('renders contact email', () => {
    const html = renderToStaticMarkup(<PrivacyPolicyPage />);
    expect(html).toContain('hello@lusk.dev');
  });

  it('links to terms page', () => {
    const html = renderToStaticMarkup(<PrivacyPolicyPage />);
    expect(html).toContain('href="/terms"');
  });
});

describe('Terms of Service page', () => {
  it('renders the Terms of Service heading', () => {
    const html = renderToStaticMarkup(<TermsOfServicePage />);
    expect(html).toContain('Terms of Service');
  });

  it('renders the back to home link', () => {
    const html = renderToStaticMarkup(<TermsOfServicePage />);
    expect(html).toContain('href="/"');
    expect(html).toContain('Back to home');
  });

  it('renders key sections', () => {
    const html = renderToStaticMarkup(<TermsOfServicePage />);
    expect(html).toContain('Acceptable Use');
    expect(html).toContain('Intellectual Property');
    expect(html).toContain('Open Source Projects');
    expect(html).toContain('Limitation of Liability');
    expect(html).toContain('Contact');
  });

  it('renders contact email', () => {
    const html = renderToStaticMarkup(<TermsOfServicePage />);
    expect(html).toContain('hello@lusk.dev');
  });

  it('links to privacy page', () => {
    const html = renderToStaticMarkup(<TermsOfServicePage />);
    expect(html).toContain('href="/privacy"');
  });
});
