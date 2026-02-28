// Feature: website-template-repo, Property 8: Secret-guarded workflows log skip notices

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Validates: Requirements 17.2
 *
 * Known mapping of workflow files to the secrets they guard on.
 * For each (workflow, secret) pair, the workflow must contain a companion
 * skip-notice job or step that logs a `::notice::` message mentioning
 * the secret name and "skipped".
 */
const WORKFLOW_SECRET_PAIRS: Array<{ workflow: string; secret: string }> = [
  // security.yml
  { workflow: 'security.yml', secret: 'TRIVY_ENABLED' },
  { workflow: 'security.yml', secret: 'SNYK_TOKEN' },
  { workflow: 'security.yml', secret: 'SAFETY_API_KEY' },
  // lighthouse.yml
  { workflow: 'lighthouse.yml', secret: 'LHCI_GITHUB_APP_TOKEN' },
  // deploy-preview.yml
  { workflow: 'deploy-preview.yml', secret: 'VERCEL_TOKEN' },
  { workflow: 'deploy-preview.yml', secret: 'NETLIFY_AUTH_TOKEN' },
  // deploy-production.yml
  { workflow: 'deploy-production.yml', secret: 'VERCEL_TOKEN' },
  { workflow: 'deploy-production.yml', secret: 'NETLIFY_AUTH_TOKEN' },
  // sonarqube.yml
  { workflow: 'sonarqube.yml', secret: 'SONAR_TOKEN' },
  // qlty.yml
  { workflow: 'qlty.yml', secret: 'QLTY_COVERAGE_TOKEN' },
  // discord-notify.yml
  { workflow: 'discord-notify.yml', secret: 'DISCORD_WEBHOOK' },
  // ci.yml
  { workflow: 'ci.yml', secret: 'CODECOV_TOKEN' },
];

const WORKFLOWS_DIR = path.resolve(__dirname, '../../.github/workflows');

describe('Property 8: Secret-guarded workflows log skip notices', () => {
  /**
   * Validates: Requirements 17.2
   *
   * For any workflow with a secret guard, verify it contains a companion
   * job or step that logs a `::notice::` message naming the secret and
   * indicating the workflow was skipped.
   */
  it('should contain a ::notice:: skip message mentioning the secret name', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...WORKFLOW_SECRET_PAIRS),
        ({ workflow, secret }) => {
          const filePath = path.join(WORKFLOWS_DIR, workflow);

          // The workflow file must exist
          expect(fs.existsSync(filePath)).toBe(true);

          const content = fs.readFileSync(filePath, 'utf-8');

          // The file must contain a ::notice:: annotation
          expect(content).toContain('::notice::');

          // The ::notice:: message must reference the secret name
          // Find all ::notice:: lines and check at least one mentions this secret
          const lines = content.split('\n');
          const noticeLines = lines.filter((line) =>
            line.includes('::notice::'),
          );

          const hasSecretInNotice = noticeLines.some((line) =>
            line.includes(secret),
          );
          expect(hasSecretInNotice).toBe(true);

          // The ::notice:: message must mention "skipped" (case-insensitive)
          const hasSkippedInNotice = noticeLines.some((line) =>
            line.toLowerCase().includes('skipped'),
          );
          expect(hasSkippedInNotice).toBe(true);
        },
      ),
      { numRuns: 100 },
    );
  });
});
