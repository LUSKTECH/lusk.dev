// @vitest-environment jsdom

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';

const mockCaptureException = vi.fn();

vi.mock('@sentry/nextjs', () => ({
  captureException: (...args: unknown[]) => mockCaptureException(...args),
}));

vi.mock('next/error', () => ({
  default: ({ statusCode }: { statusCode: number }) =>
    React.createElement('div', { 'data-status': statusCode }, 'Error'),
}));

import GlobalError from '@/app/global-error';

let container: HTMLDivElement;
let root: Root;

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  mockCaptureException.mockClear();
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

describe('GlobalError DOM', () => {
  it('calls Sentry.captureException on mount via useEffect', async () => {
    const error = new Error('test error') as Error & { digest?: string };

    await act(async () => {
      root.render(<GlobalError error={error} />);
    });

    expect(mockCaptureException).toHaveBeenCalledWith(error);
  });
});
