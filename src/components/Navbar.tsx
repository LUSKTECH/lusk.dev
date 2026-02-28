'use client';

import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="navbar" role="navigation" aria-label="Main navigation">
      <Link href="/" className="nav-brand">
        <span className="dot" aria-hidden="true" />
        lusk.dev
      </Link>
      <ul className="nav-links">
        <li>
          <Link href="/#projects">Projects</Link>
        </li>
        <li>
          <Link href="/#toolbox">Toolbox</Link>
        </li>
        <li>
          <Link href="/#contact" className="nav-cta">
            Say Hello
          </Link>
        </li>
      </ul>
    </nav>
  );
}
