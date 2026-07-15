import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import ParticleBackground from '@/components/ParticleBackground';
import CopyCommand from '@/components/CopyCommand';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://lusk.dev';
const REPO = 'https://github.com/LUSKTECH/browser-organizer';
const NPM = 'https://www.npmjs.com/package/@lusktech/browser-organizer-host';

export const metadata: Metadata = {
  title: 'Browser Organizer',
  description:
    'A Chrome and Edge extension that groups your tabs, closes forgotten ones, and tidies bookmarks using your own AI. Your data stays on your machine.',
  alternates: { canonical: `${siteUrl}/browser-organizer` },
  openGraph: {
    title: 'Browser Organizer',
    description:
      'Group tabs, close forgotten ones, and tidy bookmarks with your own AI. Chrome and Edge.',
    url: `${siteUrl}/browser-organizer`,
    type: 'website',
  },
};

const CHIPS = [
  'Group by topic',
  'Close stale tabs',
  "Suspend, don't lose",
  'Bookmark the keepers',
  'One-click undo',
];

const FEATURES: {
  icon: string;
  tone: string;
  title: string;
  body: ReactNode;
}[] = [
  {
    icon: '⬡',
    tone: 'purple',
    title: 'Tidy bookmarks',
    body: 'Finds duplicate, stale, and dead bookmarks, with an optional link check, and files the useful ones into clean folders.',
  },
  {
    icon: '◈',
    tone: 'pink',
    title: 'Plain-language commands',
    body: (
      <>
        Type{' '}
        <code style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
          org close everything about travel
        </code>{' '}
        in the address bar and it builds an actionable plan.
      </>
    ),
  },
  {
    icon: '△',
    tone: 'amber',
    title: 'Set it and forget it',
    body: 'Scheduled auto-mode runs quietly in the background. Every action is logged so a single click undoes it.',
  },
];

const BACKENDS: { emoji: string; name: string; note: string }[] = [
  { emoji: '🧠', name: 'Claude Code', note: 'Default, no API key' },
  { emoji: '🪐', name: 'Antigravity', note: 'Gemini-powered CLI' },
  { emoji: '🌀', name: 'Kiro', note: 'Kiro Pro CLI' },
  { emoji: '🐙', name: 'GitHub Copilot', note: 'Your Copilot plan' },
  { emoji: '📟', name: 'OpenAI Codex', note: 'ChatGPT or API key' },
  { emoji: '🦙', name: 'Ollama', note: 'Fully local, offline' },
  { emoji: '🔌', name: 'OpenAI API', note: 'Any compatible key' },
  { emoji: '➕', name: 'And more', note: 'OpenRouter, Groq, vLLM' },
];

const SHOTS: { src: string; alt: string; caption: string }[] = [
  {
    src: '/browser-organizer/panel-analyze.png',
    alt: 'The side panel after Analyze: open tabs clustered into named groups like React Docs and Daily Times, ready to review.',
    caption: 'Analyze once, get named tab groups you approve.',
  },
  {
    src: '/browser-organizer/panel-bookmarks.png',
    alt: 'The bookmark-cleanup view listing duplicate bookmarks to delete, each with its URL, before anything is removed.',
    caption: 'Duplicate, stale, and dead bookmarks, flagged for review.',
  },
  {
    src: '/browser-organizer/panel-settings.png',
    alt: 'Settings, showing the AI backend dropdown and toggles for grouping, stale tabs, auto-bookmarking, and dead-link checks.',
    caption: 'Pick a backend and toggle exactly what it touches.',
  },
];

function Hero() {
  return (
    <section className="hero">
      <ParticleBackground />
      <div className="hero-inner">
        <div className="hero-badge">
          <span aria-hidden="true">⚡</span> Open source &middot; Chrome &amp;
          Edge
        </div>
        <h1>
          <span className="line-1">Tabs and bookmarks,</span>
          <span className="line-2">sorted by your own AI.</span>
        </h1>
        <p className="hero-desc">
          <strong>Browser Organizer</strong> groups your open tabs by topic,
          closes the ones you forgot, and clears out dead or duplicate
          bookmarks. It runs on a local AI CLI or your own OpenAI-compatible
          key, so your tabs only ever reach the provider you already pay for.
          Review every change, or let it run on a schedule with one-click undo.
        </p>
        <div className="hero-actions">
          <a href="#install" className="btn-primary">
            Install it ↓
          </a>
          <a
            href={REPO}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ghost"
          >
            View on GitHub
          </a>
        </div>
      </div>
    </section>
  );
}

function Features() {
  return (
    <section className="section" id="features">
      <span className="section-label">Features</span>
      <h2 className="section-heading">What it does</h2>
      <p className="section-desc">
        Four kinds of cleanup, one button. Everything is a suggestion you
        approve before it happens.
      </p>

      <div className="featured-project">
        <div className="featured-label">
          <span aria-hidden="true">★</span> The main event
        </div>
        <h3>Turn a 200-tab window into named groups.</h3>
        <p className="desc">
          Click Analyze and Browser Organizer reads your open tabs, clusters
          them by topic, and proposes tidy tab groups. Forgotten tabs get
          flagged to close or suspend, and anything worth keeping is bookmarked
          first.
        </p>
        <div className="featured-features">
          {CHIPS.map((c) => (
            <span className="feature-chip" key={c}>
              {c}
            </span>
          ))}
        </div>
        <a
          href={REPO}
          target="_blank"
          rel="noopener noreferrer"
          className="featured-link"
        >
          See it on GitHub →
        </a>
      </div>

      <div className="projects-grid">
        {FEATURES.map((f) => (
          <div className="project-card" key={f.title}>
            <div className={`card-icon ${f.tone}`} aria-hidden="true">
              {f.icon}
            </div>
            <h3>{f.title}</h3>
            <p className="card-desc">{f.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Screenshots() {
  return (
    <section className="section" id="screenshots">
      <span className="section-label">Screenshots</span>
      <h2 className="section-heading">A look inside the panel</h2>
      <p className="section-desc">
        Everything runs from one side panel. Here it is grouping tabs, cleaning
        up bookmarks, and letting you choose the AI that does the work.
      </p>
      <div className="bo-shots">
        {SHOTS.map((s) => (
          <figure className="bo-shot" key={s.src}>
            <Image
              src={s.src}
              alt={s.alt}
              width={398}
              height={512}
              sizes="(max-width: 640px) 360px, 320px"
              style={{ width: '100%', height: 'auto' }}
            />
            <figcaption>{s.caption}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

function Backends() {
  return (
    <section className="section" id="backends">
      <span className="section-label">Backends</span>
      <h2 className="section-heading">Bring your own AI</h2>
      <p className="section-desc">
        No accounts with us, no servers we run. Point it at a local AI CLI or
        any OpenAI-compatible endpoint. Your tab titles and URLs go only to the
        provider you choose; bookmarks and history never leave your machine.
      </p>
      <div className="toolbox-grid">
        {BACKENDS.map((b) => (
          <div className="toolbox-cell" key={b.name}>
            <span className="toolbox-emoji" aria-hidden="true">
              {b.emoji}
            </span>
            <div className="toolbox-name">{b.name}</div>
            <div className="toolbox-desc">{b.note}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Step({
  num,
  title,
  children,
}: {
  num: number;
  title: string;
  children: ReactNode;
}) {
  return (
    <li className="bo-step">
      <span className="bo-step-num" aria-hidden="true">
        {num}
      </span>
      <div>
        <h3>{title}</h3>
        {children}
      </div>
    </li>
  );
}

function Install() {
  return (
    <section className="section" id="install">
      <span className="section-label">Install</span>
      <h2 className="section-heading">Up and running in minutes</h2>
      <p className="section-desc">
        Two parts: the extension, and a small local helper that runs your AI
        backend.
      </p>

      <ol className="bo-steps">
        <Step num={1} title="Load the extension">
          <p>
            Add Browser Organizer to Chrome or Edge (unpacked today, one-click
            from the stores soon).
          </p>
        </Step>
        <Step num={2} title="Install the helper">
          <p>With Node 20+ installed, run this from any terminal:</p>
          <CopyCommand command="npx @lusktech/browser-organizer-host" />
          <p>
            No terminal? Grab the per-OS installer from the{' '}
            <a
              href={`${REPO}/releases`}
              target="_blank"
              rel="noopener noreferrer"
            >
              releases page
            </a>
            .
          </p>
        </Step>
        <Step num={3} title="Pick a backend">
          <p>
            Open the side panel, choose your AI in Settings, and click Analyze.
            See the{' '}
            <a
              href={`${REPO}/blob/main/INSTALL.md`}
              target="_blank"
              rel="noopener noreferrer"
            >
              full install guide
            </a>{' '}
            for details.
          </p>
        </Step>
      </ol>
    </section>
  );
}

function ClosingCta() {
  return (
    <section className="section bo-cta">
      <h2 className="section-heading">Get your tabs under control.</h2>
      <p className="section-desc" style={{ margin: '0 auto 2.5rem' }}>
        Free, open source, and yours to run however you like.
      </p>
      <div className="hero-actions" style={{ justifyContent: 'center' }}>
        <a href="#install" className="btn-primary">
          Install it
        </a>
        <a
          href={REPO}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-ghost"
        >
          View on GitHub
        </a>
      </div>
      <div className="bo-cta-links">
        <Link href="/browser-organizer/privacy">Privacy policy</Link>
        <a href={NPM} target="_blank" rel="noopener noreferrer">
          npm package
        </a>
        <a href={`${REPO}/issues`} target="_blank" rel="noopener noreferrer">
          Report an issue
        </a>
      </div>
    </section>
  );
}

export default function BrowserOrganizerPage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Features />
        <div className="divider" />
        <Screenshots />
        <div className="divider" />
        <Backends />
        <div className="divider" />
        <Install />
        <div className="divider" />
        <ClosingCta />
      </main>
    </>
  );
}
