'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Brand } from './brand';

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
            v0.1.1 <span className="status-dot" />
          </Link>
        </nav>
        <Link className="header-cta" href="/docs">
          Get started <span aria-hidden="true">↗</span>
        </Link>
      </div>
    </header>
  );
}
