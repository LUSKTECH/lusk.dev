import { describe, it, expect, vi } from 'vitest';
import { createAxiomLogger, type AxiomConfig } from '@/lib/axiom';

function makeConfig(overrides: Partial<AxiomConfig> = {}): AxiomConfig {
  return {
    token: 'test-token',
    dataset: 'test-dataset',
    enabled: true,
    ...overrides,
  };
}

describe('createAxiomLogger default sink', () => {
  it('uses console.log as default sink when no sink is provided', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const logger = createAxiomLogger(makeConfig());

    logger.logPageView('/test');

    expect(consoleSpy).toHaveBeenCalledTimes(1);
    const logged = JSON.parse(consoleSpy.mock.calls[0][0] as string);
    expect(logged.type).toBe('page-view');
    expect(logged.data.path).toBe('/test');

    consoleSpy.mockRestore();
  });
});
