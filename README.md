# lusk.dev

[![CI](https://github.com/LUSKTECH/lusk.dev/actions/workflows/ci.yml/badge.svg)](https://github.com/LUSKTECH/lusk.dev/actions/workflows/ci.yml)
[![codecov](https://codecov.io/github/LUSKTECH/lusk.dev/graph/badge.svg?token=DZAKJ398QW)](https://codecov.io/github/LUSKTECH/lusk.dev)
[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=LUSKTECH_lusk.dev&metric=security_rating)](https://sonarcloud.io/summary/new_code?id=LUSKTECH_lusk.dev)[![Reliability Rating](https://sonarcloud.io/api/project_badges/measure?project=LUSKTECH_lusk.dev&metric=reliability_rating)](https://sonarcloud.io/summary/new_code?id=LUSKTECH_lusk.dev)[![Maintainability Rating](https://sonarcloud.io/api/project_badges/measure?project=LUSKTECH_lusk.dev&metric=sqale_rating)](https://sonarcloud.io/summary/new_code?id=LUSKTECH_lusk.dev)[![Quality gate](https://sonarcloud.io/api/project_badges/quality_gate?project=LUSKTECH_lusk.dev)](https://sonarcloud.io/summary/new_code?id=LUSKTECH_lusk.dev)[![Lines of Code](https://sonarcloud.io/api/project_badges/measure?project=LUSKTECH_lusk.dev&metric=ncloc)](https://sonarcloud.io/summary/new_code?id=LUSKTECH_lusk.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

The personal developer portfolio for [Cody (lusky3)](https://github.com/lusky3), built under **Lusk Technologies, Inc.** Showcases open-source projects for WordPress, Docker, MCP servers, and more.

**Live:** [https://lusk.dev](https://lusk.dev)

## Stack

- **Next.js 16** with TypeScript 5.9 and App Router
- Interactive particle canvas background with physics-based cursor tracking
- Physics-based page transitions (fridge magnet sweep effect)
- Region-adaptive cookie consent (GDPR / CCPA / general)
- SEO — Open Graph, Twitter Cards, JSON-LD, sitemap, robots.txt
- Security headers — CSP, HSTS, X-Frame-Options via `netlify.toml`
- Deployed to **Vercel**

## Integrations

| Integration   | Status      | Purpose                                         |
| ------------- | ----------- | ----------------------------------------------- |
| Sentry        | Configured  | Client + server error tracking                  |
| Axiom         | Configured  | Structured logging, page views, web vitals      |
| Analytics     | Configured  | Consent-gated provider (GA / Plausible / Umami) |
| Codecov       | CI workflow | Test coverage reporting                         |
| SonarQube     | CI workflow | Code quality and security analysis              |
| Lighthouse CI | CI workflow | Performance, a11y, SEO checks                   |
| axe-core      | CI workflow | WCAG 2.1 AA accessibility testing               |
| Snyk          | CI workflow | Dependency vulnerability scanning               |

All integrations are secret-guarded — when the required env var or token is missing, the integration is silently skipped.

## Getting Started

```bash
npm install
cp .env.example .env.local
# Set NEXT_PUBLIC_SITE_URL=https://lusk.dev (required)
# Set optional integration tokens as needed
npm run dev
```

## Scripts

| Script                  | Description                  |
| ----------------------- | ---------------------------- |
| `npm run dev`           | Development server           |
| `npm run build`         | Production build             |
| `npm run lint`          | ESLint                       |
| `npm run format:fix`    | Prettier auto-fix            |
| `npm run test:run`      | Run tests once               |
| `npm run test:coverage` | Tests with Istanbul coverage |

## Environment Variables

Copy `.env.example` to `.env.local`. Only `NEXT_PUBLIC_SITE_URL` is required — everything else is optional and produces a warning when missing.

| Variable                 | Required | Purpose                     |
| ------------------------ | -------- | --------------------------- |
| `NEXT_PUBLIC_SITE_URL`   | Yes      | Canonical URL for SEO       |
| `NEXT_PUBLIC_GA_ID`      | No       | Google Analytics ID         |
| `AXIOM_TOKEN`            | No       | Axiom API token             |
| `AXIOM_DATASET`          | No       | Axiom dataset name          |
| `SENTRY_DSN`             | No       | Sentry DSN (server)         |
| `NEXT_PUBLIC_SENTRY_DSN` | No       | Sentry DSN (client)         |
| `SENTRY_AUTH_TOKEN`      | No       | Sentry source map uploads   |
| `NETLIFY_AUTH_TOKEN`     | No       | Netlify deployment token    |
| `CODECOV_TOKEN`          | No       | Codecov upload token        |
| `SONAR_TOKEN`            | No       | SonarQube analysis token    |
| `LHCI_GITHUB_APP_TOKEN`  | No       | Lighthouse CI token         |
| `SNYK_TOKEN`             | No       | Snyk vulnerability scanning |
| `DISCORD_WEBHOOK_URL`    | No       | CI/CD Discord notifications |

## Deployment

Deployed to Vercel. Security headers in `vercel.json`. Sentry DSN, org, and project are injected via environment variables — no hardcoded values in source.

## CI/CD Workflows

All workflows live in `.github/workflows/`. Optional integrations use a secret-guard pattern — missing secrets result in a skipped job, not a failure.

| Workflow                | Trigger          | Description                      |
| ----------------------- | ---------------- | -------------------------------- |
| `ci.yml`                | Push, PR         | Lint, format, test with coverage |
| `security.yml`          | PR, weekly       | Snyk + Trivy + Safety CLI scans  |
| `lighthouse.yml`        | PR               | Performance, a11y, SEO checks    |
| `a11y.yml`              | PR               | axe-core WCAG 2.1 AA testing     |
| `sonarqube.yml`         | PR, push to main | Code quality analysis            |
| `deploy-production.yml` | Push to main     | Netlify production deploy        |
| `deploy-preview.yml`    | PR               | Netlify preview deploy           |
| `automerge.yml`         | Dependabot PR    | Auto-merge patch/minor updates   |
| `discord-notify.yml`    | Workflow run     | Discord build notifications      |
| `stale.yml`             | Daily            | Label/close stale issues         |

## Project Structure

```text
src/
├── app/
│   ├── page.tsx              # Home page
│   ├── layout.tsx            # Root layout
│   ├── globals.css           # All styles
│   ├── privacy/page.tsx      # Privacy Policy
│   ├── terms/page.tsx        # Terms of Service
│   ├── error.tsx             # 500 error page
│   ├── not-found.tsx         # 404 page
│   ├── robots.ts             # robots.txt
│   └── sitemap.ts            # Sitemap
├── components/
│   ├── Navbar.tsx             # Sticky navigation
│   ├── Footer.tsx             # Footer with cookie preferences
│   ├── ParticleBackground.tsx # Interactive particle canvas
│   ├── PageTransition.tsx     # Physics sweep transition
│   ├── CookieBanner.tsx       # Region-adaptive consent banner
│   ├── CookiePreferences.tsx  # Cookie preference toggles
│   └── SEOHead.tsx            # SEO meta component
└── lib/
    ├── json-ld.ts             # JSON-LD structured data
    ├── cookie-consent.ts      # Consent state management
    ├── analytics.ts           # Consent-gated analytics
    ├── axiom.ts               # Axiom structured logging
    ├── sentry.ts              # Sentry error tracking
    ├── csp.ts                 # CSP header builder
    └── env.ts                 # Zod env validation
```

## License

MIT — see [LICENSE](LICENSE).

## Repobeats

![Alt](https://repobeats.axiom.co/api/embed/f1c91a68918a5929c8199e3a79ce282399e58a19.svg 'Repobeats analytics image')

## AI Usage Disclaimer

Portions of this codebase were generated with the assistance of Large Language Models (LLMs). All AI-generated code has been reviewed and tested to ensure quality and correctness.
