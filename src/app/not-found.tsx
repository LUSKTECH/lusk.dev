import Link from 'next/link';

export default function NotFound() {
  return (
    <section
      className="section"
      style={{
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
      }}
    >
      <h1 className="section-title">404 — Page Not Found</h1>
      <p
        style={{
          color: 'var(--text-muted)',
          marginBottom: '2rem',
          maxWidth: 480,
        }}
      >
        Sorry, the page you are looking for does not exist or has been moved.
      </p>
      <Link href="/" className="hero-cta">
        Return Home
      </Link>
    </section>
  );
}
