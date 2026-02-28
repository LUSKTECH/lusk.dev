import Navbar from '@/components/Navbar';
import ParticleBackground from '@/components/ParticleBackground';

export default function Home() {
  return (
    <>
      <Navbar />

      {/* ── Hero ── */}
      <section className="hero" id="home">
        <ParticleBackground />
        <div className="hero-inner">
          <div className="hero-badge">
            <span aria-hidden="true">⚡</span> Open source &middot; Always free
          </div>
          <h1>
            <span className="line-1">Tools that make</span>
            <span className="line-2">WordPress work harder.</span>
          </h1>
          <p className="hero-desc">
            I&apos;m <strong>Cody</strong>, and I build developer tools under{' '}
            <strong>Lusk Technologies</strong>. WordPress plugins, Docker
            agents, MCP servers, and whatever else scratches the itch.
          </p>
          <div className="hero-actions">
            <a href="#projects" className="btn-primary">
              Browse Projects ↓
            </a>
            <a
              href="https://github.com/lusky3"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost"
            >
              GitHub @lusky3
            </a>
          </div>
        </div>
      </section>

      {/* ── Featured Project ── */}
      <section className="section" id="projects">
        <span className="section-label">Featured</span>
        <h2 className="section-heading">Bulk Plugin Installer for WordPress</h2>
        <p className="section-desc">
          The one that started it all. Upload a stack of plugin ZIPs and install
          them in one shot — with preview, rollback, and profile support baked
          in.
        </p>

        <div className="featured-project">
          <div className="featured-label">
            <span aria-hidden="true">★</span> Flagship Project
          </div>
          <h3>Stop installing plugins one at a time.</h3>
          <p className="desc">
            Bulk Plugin Installer lets WordPress admins upload multiple plugin
            ZIP files and install them in a single operation. Preview what
            you&apos;re about to install, roll back if something breaks, and
            save plugin sets as reusable profiles for new site setups.
          </p>
          <div className="featured-features">
            <span className="feature-chip">Multi-file upload</span>
            <span className="feature-chip">Install preview</span>
            <span className="feature-chip">One-click rollback</span>
            <span className="feature-chip">Profile support</span>
            <span className="feature-chip">WP Admin integration</span>
          </div>
          <a
            href="https://github.com/lusky3/bulk-plugin-installer-for-wordpress"
            target="_blank"
            rel="noopener noreferrer"
            className="featured-link"
          >
            View on GitHub →
          </a>
        </div>

        {/* ── Other Projects ── */}
        <div className="projects-grid">
          <a
            href="https://github.com/lusky3/play-store-mcp"
            target="_blank"
            rel="noopener noreferrer"
            className="project-card"
          >
            <div className="card-icon purple" aria-hidden="true">
              ⬡
            </div>
            <h3>Play Store MCP</h3>
            <p className="card-desc">
              An MCP server that plugs into the Google Play Developer API.
              Deploy apps, manage listings, and check vitals — all from your AI
              coding assistant.
            </p>
            <div className="card-meta">
              <span className="card-lang">
                <span className="lang-dot python" aria-hidden="true" />
                Python
              </span>
              <span className="card-arrow" aria-hidden="true">
                →
              </span>
            </div>
          </a>

          <a
            href="https://github.com/lusky3/dockwatch-agent"
            target="_blank"
            rel="noopener noreferrer"
            className="project-card"
          >
            <div className="card-icon pink" aria-hidden="true">
              ◈
            </div>
            <h3>Dockwatch Agent</h3>
            <p className="card-desc">
              A lightweight, headless agent for the Dockwatch API. Monitor and
              manage Docker containers on remote hosts without the full UI.
            </p>
            <div className="card-meta">
              <span className="card-lang">
                <span className="lang-dot javascript" aria-hidden="true" />
                JavaScript
              </span>
              <span className="card-arrow" aria-hidden="true">
                →
              </span>
            </div>
          </a>

          <a
            href="https://github.com/lusky3/transfer.sh-web"
            target="_blank"
            rel="noopener noreferrer"
            className="project-card"
          >
            <div className="card-icon amber" aria-hidden="true">
              △
            </div>
            <h3>transfer.sh Web</h3>
            <p className="card-desc">
              Flow — a modern refresh of the transfer.sh web interface.
              Drag-and-drop uploads, clean UI, and a better experience for
              sharing files.
            </p>
            <div className="card-meta">
              <span className="card-lang">
                <span className="lang-dot typescript" aria-hidden="true" />
                TypeScript
              </span>
              <span className="card-arrow" aria-hidden="true">
                →
              </span>
            </div>
          </a>
        </div>
      </section>

      <div className="divider" />

      {/* ── Toolbox ── */}
      <section className="section" id="toolbox">
        <span className="section-label">Toolbox</span>
        <h2 className="section-heading">What I work with</h2>
        <p className="section-desc">
          The stack behind the projects. If it solves a real problem, it makes
          the cut.
        </p>
        <div className="toolbox-grid">
          <div className="toolbox-cell">
            <span className="toolbox-emoji" aria-hidden="true">
              🔌
            </span>
            <div className="toolbox-name">WordPress</div>
            <div className="toolbox-desc">Plugins &amp; admin tools</div>
          </div>
          <div className="toolbox-cell">
            <span className="toolbox-emoji" aria-hidden="true">
              🐳
            </span>
            <div className="toolbox-name">Docker</div>
            <div className="toolbox-desc">Containers &amp; agents</div>
          </div>
          <div className="toolbox-cell">
            <span className="toolbox-emoji" aria-hidden="true">
              🤖
            </span>
            <div className="toolbox-name">MCP</div>
            <div className="toolbox-desc">AI tool servers</div>
          </div>
          <div className="toolbox-cell">
            <span className="toolbox-emoji" aria-hidden="true">
              ⚡
            </span>
            <div className="toolbox-name">TypeScript</div>
            <div className="toolbox-desc">Web &amp; tooling</div>
          </div>
          <div className="toolbox-cell">
            <span className="toolbox-emoji" aria-hidden="true">
              🐍
            </span>
            <div className="toolbox-name">Python</div>
            <div className="toolbox-desc">APIs &amp; automation</div>
          </div>
          <div className="toolbox-cell">
            <span className="toolbox-emoji" aria-hidden="true">
              🐘
            </span>
            <div className="toolbox-name">PHP</div>
            <div className="toolbox-desc">WordPress core</div>
          </div>
          <div className="toolbox-cell">
            <span className="toolbox-emoji" aria-hidden="true">
              🔧
            </span>
            <div className="toolbox-name">Next.js</div>
            <div className="toolbox-desc">This very site</div>
          </div>
          <div className="toolbox-cell">
            <span className="toolbox-emoji" aria-hidden="true">
              📦
            </span>
            <div className="toolbox-name">Open Source</div>
            <div className="toolbox-desc">Everything, always</div>
          </div>
        </div>
      </section>

      <div className="divider" />

      {/* ── Contact ── */}
      <section className="section contact-section" id="contact">
        <span className="section-label">Contact</span>
        <h2 className="section-heading">Let&apos;s build something.</h2>
        <p className="section-desc" style={{ margin: '0 auto 3rem' }}>
          Got an idea, a bug report, or just want to say hey? I read every
          email.
        </p>
        <div className="contact-card">
          <a href="mailto:hello@lusk.dev" className="email-link">
            hello@lusk.dev
          </a>
          <span className="email-hint">
            Or find me on{' '}
            <a
              href="https://github.com/lusky3"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--accent)', fontWeight: 600 }}
            >
              GitHub
            </a>
          </span>
        </div>
      </section>
    </>
  );
}
