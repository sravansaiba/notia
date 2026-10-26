'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Brand } from './brand';
import { ThemeSwitch } from './theme-switch';

export function Header() {
  const pathname = usePathname() ?? '/';
  return (
    <header className="site-header">
      <div className="header-inner">
        <Link href="/" aria-label="Notia home">
          <Brand />
        </Link>
        <nav aria-label="Main navigation">
          <Link
            href="/docs"
            aria-current={pathname.startsWith('/docs') ? 'page' : undefined}
          >
            Docs
          </Link>
          <Link
            href="/playground"
            aria-current={pathname === '/playground' ? 'page' : undefined}
          >
            Playground
          </Link>
          <Link className="nav-release" href="/docs/releases">
            v0.2.0 <span className="status-dot" />
          </Link>
          <a
            className="github-link"
            href="https://github.com/sravansaiba/notia"
            aria-label="Notia on GitHub"
            title="View source on GitHub"
          >
            <svg
              viewBox="0 0 24 24"
              width="20"
              height="20"
              fill="currentColor"
              aria-hidden="true"
              focusable="false"
            >
              <path d="M12 .75a11.25 11.25 0 0 0-3.558 21.924c.563.104.77-.244.77-.542 0-.267-.01-.975-.015-1.914-3.13.68-3.79-1.508-3.79-1.508-.512-1.3-1.25-1.647-1.25-1.647-1.022-.699.078-.685.078-.685 1.13.08 1.725 1.16 1.725 1.16 1.005 1.723 2.637 1.225 3.28.936.102-.728.393-1.225.715-1.506-2.499-.284-5.126-1.25-5.126-5.563 0-1.23.44-2.234 1.16-3.022-.116-.285-.503-1.431.11-2.982 0 0 .945-.302 3.094 1.155a10.79 10.79 0 0 1 2.817-.38c.957.005 1.92.13 2.817.38 2.148-1.457 3.091-1.155 3.091-1.155.615 1.55.229 2.697.113 2.982.722.788 1.158 1.792 1.158 3.022 0 4.325-2.631 5.276-5.137 5.554.404.35.764 1.042.764 2.1 0 1.515-.014 2.737-.014 3.108 0 .3.203.651.774.541A11.252 11.252 0 0 0 12 .75Z" />
            </svg>
          </a>
        </nav>
        <ThemeSwitch />
        <Link className="header-cta" href="/docs">
          Get started <span aria-hidden="true">↗</span>
        </Link>
      </div>
    </header>
  );
}
