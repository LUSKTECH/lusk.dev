# Implementation Plan: Website Template Repository

## Overview

Build a reusable Next.js/TypeScript website template repository for Lusk Technologies with compliance pages, analytics/monitoring integrations, security tooling, CI/CD workflows, GitHub community documents, and Vercel/Netlify deployment support. Implementation proceeds bottom-up: project scaffolding → core utilities → integration layer → application layer → CI/CD layer → deployment config → documentation.

## Tasks

- [x] 1. Project scaffolding and core configuration
  - [x] 1.1 Initialize Next.js project with TypeScript and install dependencies
    - Initialize Next.js with TypeScript, ESLint, and App Router
    - Install dependencies: `zod`, `@sentry/nextjs`, `next-axiom` (or Axiom client), `fast-check`, `vitest`, `@vitest/coverage-istanbul`, `husky`, `lint-staged`, `@commitlint/cli`, `@commitlint/config-conventional`, `prettier`
    - Create `tsconfig.json` with strict mode enabled
    - Create `.env.example` with all environment variables documented with placeholder values and descriptions
    - _Requirements: 28.1_

  - [x] 1.2 Configure Prettier and ESLint
    - Create `.prettierrc` with formatting rules (semi, singleQuote, trailingComma, printWidth, tabWidth)
    - Create `.prettierignore` excluding `node_modules`, `.next`, `out`, `coverage`, `build`
    - Configure ESLint extending `next/core-web-vitals` and `next/typescript`
    - _Requirements: 31.1, 31.2, 9.1_

  - [x] 1.3 Configure Husky, lint-staged, and commitlint
    - Initialize Husky with `npx husky init`
    - Create `.husky/pre-commit` hook running `npx lint-staged`
    - Create `.husky/commit-msg` hook running `npx commitlint --edit $1`
    - Create `commitlint.config.js` extending `@commitlint/config-conventional`
    - Add lint-staged config to `package.json`: `*.{ts,tsx,js,jsx}` → eslint --fix + prettier --write; `*.{json,md,yml,yaml,css}` → prettier --write
    - _Requirements: 30.1, 30.2, 30.3_

  - [x] 1.4 Configure Vitest with coverage
    - Create `vitest.config.ts` with Istanbul coverage provider, lcov reporter, and test file patterns for `__tests__/**/*.test.ts` and `__tests__/**/*.property.test.ts`
    - Create `__tests__/` directory structure: `unit/pages/`, `unit/components/`, `unit/config/`, `unit/workflows/`, `unit/integrations/`, `properties/`
    - Add test scripts to `package.json`: `test`, `test:coverage`, `test:run`
    - _Requirements: 32.4_

- [x] 2. Environment variable validation
  - [x] 2.1 Implement Zod-based env validation
    - Create `src/lib/env.ts` with Zod schema defining required vars (`NEXT_PUBLIC_SITE_URL`) and optional vars (`NEXT_PUBLIC_GA_ID`, `AXIOM_TOKEN`, `AXIOM_DATASET`, `SENTRY_DSN`, `SENTRY_AUTH_TOKEN`, `DISCORD_WEBHOOK_URL`, `VERCEL_TOKEN`, `NETLIFY_AUTH_TOKEN`)
    - Implement `validateEnv()` function that throws on missing required vars and logs warnings for missing optional vars
    - Export typed `Env` type from the schema
    - _Requirements: 28.2, 28.3_

  - [x] 2.2 Write property test for env validation (Property 10)
    - **Property 10: Environment validation distinguishes required vs optional**
    - Test that missing required vars cause `validateEnv()` to throw, and missing optional vars produce warnings but no throw
    - **Validates: Requirements 28.2, 28.3**

- [x] 3. Checkpoint - Ensure project scaffolding is solid
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Cookie consent system
  - [x] 4.1 Implement region classifier and consent state utilities
    - Create `src/lib/cookie-consent.ts` with:
      - `CookieConsentState` interface (essential, analytics, marketing, region, consentedAt, version)
      - `classifyRegion(regionCode: string | null | undefined): 'eu' | 'ccpa' | 'general'` — maps EU country codes → `'eu'`, `'US-CA'` → `'ccpa'`, null/undefined → `'eu'` (fallback), all others → `'general'`
      - `saveConsent(state: CookieConsentState): void` — writes to localStorage key `lusk-cookie-consent`
      - `loadConsent(): CookieConsentState | null` — reads from localStorage, returns null if missing or corrupted
      - `resetConsent(): void` — removes the localStorage key
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 25.3_

  - [x] 4.2 Write property test for region classifier (Property 1)
    - **Property 1: Region-based banner selection**
    - For any region code, verify the classifier returns the correct banner type; null/undefined defaults to `'eu'`
    - **Validates: Requirements 2.1, 2.3, 2.6**

  - [x] 4.3 Write property test for consent persistence (Property 2)
    - **Property 2: Consent state round-trip persistence**
    - For any valid `CookieConsentState`, writing to localStorage and reading back produces an identical object
    - **Validates: Requirements 2.5, 25.3**

  - [x] 4.4 Implement CookieBanner component
    - Create `src/components/CookieBanner.tsx` implementing the `CookieBannerProps` interface from the design
    - Render GDPR banner (opt-in required) for `'eu'` region
    - Render CCPA banner (with "Do Not Sell" option) for `'ccpa'` region
    - Render informational banner for `'general'` region
    - Call geolocation endpoint (configurable via prop) on mount if no consent in localStorage
    - On consent, persist state and call `onConsentChange` callback
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

  - [x] 4.5 Implement CookiePreferences component
    - Create `src/components/CookiePreferences.tsx`
    - Display toggles for each cookie category (essential always on, analytics, marketing)
    - Read current state from localStorage on mount
    - On update, persist to localStorage and immediately enable/disable tracking scripts
    - Accessible from footer link and from the banner
    - _Requirements: 25.1, 25.2, 25.3_

  - [x] 4.6 Write property test for cookie preferences UI (Property 9)
    - **Property 9: Cookie preferences UI reflects stored state**
    - For any valid `CookieConsentState`, the preferences component renders toggles matching the stored boolean values
    - **Validates: Requirements 25.2**

- [x] 5. Integration layer
  - [x] 5.1 Implement analytics integration with consent gating
    - Create `src/lib/analytics.ts` with `AnalyticsConfig` interface and `initAnalytics(config, consent)` function
    - Only initialize tracking when `config.enabled` is true AND `consent.analytics` is true
    - Return no-op when analytics env var is missing
    - _Requirements: 3.1, 3.2, 3.3_

  - [x] 5.2 Write property test for consent-gated script loading (Property 3)
    - **Property 3: Consent-gated script loading**
    - For any `CookieConsentState`, tracking scripts load iff `analytics` is `true`
    - **Validates: Requirements 3.3**

  - [x] 5.3 Implement Axiom integration
    - Create `src/lib/axiom.ts` with `AxiomConfig` interface and `AxiomLogger` implementation
    - Implement `logPageView`, `logError`, `logWebVitals` methods producing structured log entries with timestamps
    - Return no-op logger when `AXIOM_TOKEN` is unset
    - _Requirements: 4.1, 4.2, 4.3_

  - [x] 5.4 Write property test for Axiom logger (Property 5)
    - **Property 5: Axiom logger produces structured output**
    - For any page path, error, or web vitals input, the logger produces a structured entry with the input data and a timestamp
    - **Validates: Requirements 4.3**

  - [x] 5.5 Implement Sentry integration
    - Create `src/lib/sentry.ts` with `SentryConfig` interface and `initSentry(config)` function
    - Configure client-side and server-side error capture
    - Return no-op when `SENTRY_DSN` is unset
    - Create `sentry.client.config.ts` and `sentry.server.config.ts` entry points
    - _Requirements: 5.1, 5.2, 5.3_

  - [x] 5.6 Write property test for Sentry error capture (Property 6)
    - **Property 6: Sentry captures errors with metadata**
    - For any Error object and context metadata, the capture function produces a report with error message, stack trace, and all metadata keys
    - **Validates: Requirements 5.3**

  - [x] 5.7 Write property test for graceful degradation (Property 4)
    - **Property 4: Graceful degradation for missing integration env vars**
    - For any optional integration, calling init with missing env var does not throw and returns a disabled/no-op instance
    - **Validates: Requirements 3.2, 4.2, 5.2**

- [x] 6. Checkpoint - Ensure integration layer tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. SEO, metadata, and security headers
  - [x] 7.1 Implement SEO metadata component
    - Create `src/components/SEOHead.tsx` implementing the `SEOProps` interface
    - Render Open Graph meta tags (`og:title`, `og:description`, `og:image`, `og:url`, `og:type`)
    - Render Twitter Card meta tags (`twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`)
    - Render canonical `<link>` tag
    - Render JSON-LD `<script>` tag when `jsonLd` prop is provided
    - _Requirements: 33.1, 33.2_

  - [x] 7.2 Write property test for SEO component (Property 13)
    - **Property 13: SEO component renders correct meta tags**
    - For any valid `SEOProps`, the rendered output contains the correct OG, Twitter, and canonical tags
    - **Validates: Requirements 33.1, 33.2**

  - [x] 7.3 Implement JSON-LD generator for organization schema
    - Create `src/lib/json-ld.ts` with a function that generates Organization schema JSON-LD from `SiteMetadata`
    - Output must include `@context: "https://schema.org"`, `@type: "Organization"`, and input fields
    - _Requirements: 33.3_

  - [x] 7.4 Write property test for JSON-LD output (Property 14)
    - **Property 14: JSON-LD produces valid structured data**
    - For any organization data, the output parses to valid schema.org Organization with correct fields
    - **Validates: Requirements 33.3**

  - [x] 7.5 Implement CSP builder and security headers config
    - Create `src/lib/csp.ts` with a `buildCSP(config)` function that produces a Content-Security-Policy header string from configurable domain lists
    - Configure security headers in `vercel.json`: CSP, X-Frame-Options (DENY), X-Content-Type-Options (nosniff), Referrer-Policy (strict-origin-when-cross-origin), Permissions-Policy, Strict-Transport-Security
    - Configure matching security headers in `netlify.toml`
    - _Requirements: 29.1, 29.2, 29.3_

  - [x] 7.6 Write property test for CSP builder (Property 11)
    - **Property 11: CSP builder produces valid header from config**
    - For any set of allowed domains, the builder produces a valid CSP string with correct directive syntax
    - **Validates: Requirements 29.3**

- [x] 8. Application pages
  - [x] 8.1 Create Privacy Policy page
    - Create `src/app/privacy/page.tsx` with placeholder sections: Data Collection, Data Usage, Third-Party Sharing, User Rights, Contact Information
    - Include cross-link to Terms of Service page
    - Use site layout and SEOHead component
    - _Requirements: 1.1, 1.2, 24.3_

  - [x] 8.2 Create Terms of Service page
    - Create `src/app/terms/page.tsx` with placeholder sections: Acceptable Use, Intellectual Property, Limitation of Liability, Governing Law, Contact Information
    - Include cross-link to Privacy Policy page
    - Use site layout and SEOHead component
    - _Requirements: 24.1, 24.2, 24.3_

  - [x] 8.3 Create custom error pages
    - Create `src/app/not-found.tsx` (404) with navigation back to home, matching site branding
    - Create `src/app/error.tsx` (500) with user-friendly error message, matching site branding
    - _Requirements: 27.1, 27.2, 27.3_

  - [x] 8.4 Create root layout with cookie banner and footer
    - Create/update `src/app/layout.tsx` with:
      - HTML head with favicon links, manifest reference, and default SEO metadata
      - CookieBanner component
      - Footer with link to CookiePreferences
      - JSON-LD Organization structured data
    - _Requirements: 25.1, 33.2, 33.3, 34.3_

  - [x] 8.5 Create robots.txt and sitemap
    - Create `public/robots.txt` allowing all crawlers, referencing sitemap URL
    - Create `src/app/sitemap.ts` (Next.js sitemap generation) or `public/sitemap.xml` placeholder
    - _Requirements: 26.1, 26.2, 26.3_

  - [x] 8.6 Create favicon set and web manifest
    - Add placeholder favicon files to `public/`: `favicon.ico`, `favicon-16x16.png`, `favicon-32x32.png`, `apple-touch-icon.png` (180x180), `android-chrome-192x192.png`, `android-chrome-512x512.png`
    - Create `public/site.webmanifest` with placeholder app name, theme color, background color, and icon references
    - _Requirements: 34.1, 34.2_

- [x] 9. Checkpoint - Ensure application layer is complete
  - Ensure all tests pass, ask the user if questions arise.

- [x] 10. GitHub community documents
  - [x] 10.1 Create standard community files
    - Create `LICENSE` with placeholder license type (MIT default)
    - Create `CONTRIBUTORS.md` with contributor list template
    - Create `CODE_OF_CONDUCT.md` based on Contributor Covenant
    - Create `SECURITY.md` with vulnerability disclosure policy template
    - _Requirements: 21.1, 21.2, 21.3, 21.5_

  - [x] 10.2 Create GitHub-specific templates and config
    - Create `.github/ISSUE_TEMPLATE/bug_report.yml` for bug reports
    - Create `.github/ISSUE_TEMPLATE/feature_request.yml` for feature requests
    - Create `.github/ISSUE_TEMPLATE/question.yml` for general questions
    - Create `.github/PULL_REQUEST_TEMPLATE.md` with standardized PR checklist
    - Create `.github/FUNDING.yml` with placeholder funding links
    - Create `.github/CODEOWNERS` with placeholder ownership rules
    - _Requirements: 21.4, 21.6, 21.7, 21.8_

- [x] 11. CI/CD workflows in template repo
  - [x] 11.1 Create ci.yml workflow (lint, format, test, coverage)
    - Create `.github/workflows/ci.yml` triggered on push and PR
    - Jobs: lint (ESLint), format-check (Prettier --check), test (Vitest --run with coverage)
    - Codecov upload step guarded by `CODECOV_TOKEN` secret with skip-notice
    - _Requirements: 9.2, 9.3, 31.3, 32.1, 32.2, 32.3, 8.1, 8.2_

  - [x] 11.2 Create security.yml workflow (Trivy, Snyk, Safety CLI)
    - Create `.github/workflows/security.yml` triggered on PR and weekly schedule
    - Each scanner in its own job with secret guard (`TRIVY_ENABLED`, `SNYK_TOKEN`, `SAFETY_API_KEY`)
    - Each guarded job has a companion skip-notice job logging which secret is missing
    - Fail on critical/high severity findings
    - _Requirements: 11.1, 11.2, 11.3, 12.1, 12.2, 12.3, 15.1, 15.2, 15.3, 17.1, 17.2_

  - [x] 11.3 Create lighthouse.yml workflow
    - Create `.github/workflows/lighthouse.yml` triggered on PR
    - Secret guard on `LHCI_GITHUB_APP_TOKEN` with skip-notice
    - Assert minimum scores for performance, accessibility, best practices, SEO
    - _Requirements: 6.1, 6.2, 6.3_

  - [x] 11.4 Create deploy-preview.yml and deploy-production.yml workflows
    - Create `.github/workflows/deploy-preview.yml` triggered on PR, guarded by `VERCEL_TOKEN` or `NETLIFY_AUTH_TOKEN`
    - Create `.github/workflows/deploy-production.yml` triggered on push to main, same secret guards
    - Both include skip-notice jobs
    - _Requirements: 22.4, 22.5_

  - [x] 11.5 Create sonarqube.yml and qlty.yml workflows
    - Create `.github/workflows/sonarqube.yml` triggered on PR and push to main, guarded by `SONAR_TOKEN`
    - Create `.github/workflows/qlty.yml` triggered on PR, guarded by `QLTY_TOKEN`
    - Both include skip-notice jobs
    - _Requirements: 13.1, 13.2, 14.1, 14.2_

  - [x] 11.6 Create a11y.yml workflow
    - Create `.github/workflows/a11y.yml` triggered on PR
    - Run axe-core accessibility testing
    - Fail on WCAG 2.1 Level AA violations
    - _Requirements: 10.1, 10.2_

  - [x] 11.7 Create stale.yml, automerge.yml, and discord-notify.yml caller workflows
    - Create `.github/workflows/stale.yml` calling `LUSKTECH/.github/.github/workflows/reusable-stale.yml` with inputs: daysBeforeStale=30, daysBeforeClose=7, exemptLabels=pinned,security
    - Create `.github/workflows/automerge.yml` for auto-merging Dependabot patch/minor PRs
    - Create `.github/workflows/discord-notify.yml` calling `LUSKTECH/.github/.github/workflows/reusable-discord-notify.yml`, guarded by `DISCORD_WEBHOOK_URL`
    - _Requirements: 16.2, 18.1, 18.2, 18.3, 19.1, 19.2, 19.3, 20.1, 20.2, 20.3, 20.4_

  - [x] 11.8 Write property test for workflow secret guards (Property 7)
    - **Property 7: Secret-guarded workflows have skip conditionals**
    - For any workflow YAML referencing an optional secret, verify it contains an `if` conditional checking for that secret
    - **Validates: Requirements 17.1**

  - [x] 11.9 Write property test for workflow skip notices (Property 8)
    - **Property 8: Secret-guarded workflows log skip notices**
    - For any workflow with a secret guard, verify it contains a companion job/step logging the skip reason
    - **Validates: Requirements 17.2**

- [x] 12. CI/CD configuration files and Dependabot
  - [x] 12.1 Create CI/CD config files
    - Create `lighthouserc.js` with configurable score thresholds
    - Create `codecov.yml` with coverage thresholds
    - Create `.qlty.toml` with quality gate thresholds
    - Create `sonar-project.properties` with project key and organization placeholders
    - Create `.github/dependabot.yml` monitoring npm, pip, and github-actions ecosystems on weekly schedule
    - Create a11y testing config file (e.g., `axe.config.js`) with configurable rule sets
    - _Requirements: 6.4, 8.3, 10.3, 13.3, 14.3, 16.1, 16.3_

- [x] 13. Reusable workflows in LUSKTECH/.github
  - [x] 13.1 Create reusable workflow files
    - Create `reusable-discord-notify.yml` accepting inputs: `webhook_url`, `status`, `repo_name`, `run_url`; sends formatted Discord embed
    - Create `reusable-stale.yml` accepting inputs: `days_before_stale`, `days_before_close`, `exempt_labels`; labels and closes stale issues/PRs
    - Create `reusable-security-scan.yml` accepting inputs: `scan_type` (trivy/snyk/safety) and token secrets; runs the specified scanner
    - Note: These files are intended for the `LUSKTECH/.github` repository, not the template repo
    - _Requirements: 18.1, 18.2_

- [x] 14. Deployment configuration
  - [x] 14.1 Create Vercel and Netlify deployment configs
    - Create `vercel.json` with security headers, sensible build defaults, and route configuration
    - Create `netlify.toml` with matching security headers, build command, publish directory, and redirect rules
    - Ensure both configs include all security headers from Requirement 29
    - _Requirements: 22.1, 22.2, 29.1, 29.2_

- [x] 15. Checkpoint - Ensure CI/CD and deployment configs are complete
  - Ensure all tests pass, ask the user if questions arise.

- [x] 16. README and documentation
  - [x] 16.1 Create comprehensive README.md
    - Write sections: project overview, quick start guide, environment variables reference, deployment instructions (Vercel + Netlify), CI/CD workflow descriptions, contributing guidelines
    - Include table of all secrets/env vars with purpose and which workflow requires them
    - Include badges for CI status, code coverage, code quality, and license
    - Include Repobeats image embed with placeholder URL
    - Document all required secrets and environment variables
    - _Requirements: 7.1, 7.2, 17.3, 22.3, 23.1, 23.2, 23.3_

- [x] 17. Commitlint property test
  - [x] 17.1 Write property test for commitlint validation (Property 12)
    - **Property 12: Commitlint validates conventional commits**
    - For any string matching `type(scope): description`, commitlint passes; for non-matching strings, it rejects
    - **Validates: Requirements 30.3**

- [x] 18. Final checkpoint - Ensure all tests pass and template is complete
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation throughout implementation
- Property tests validate the 14 correctness properties from the design document
- All TypeScript code uses strict mode
- Reusable workflows (task 13) are for the `LUSKTECH/.github` repo; all other tasks are for the template repo
- Vitest with `--run` flag should be used in CI (no watch mode)
- fast-check is used for all property-based tests with minimum 100 iterations
