'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Brand } from './brand';

const links = [
  ['/docs', 'Getting started'],
  ['/docs/api', 'API reference'],
  ['/docs/styling', 'Styling & themes'],
  ['/docs/accessibility', 'Accessibility'],
  ['/docs/releases', 'Release notes'],
] as const;
export function DocsNav() {
  const pathname = usePathname();
  return (
    <aside className="docs-nav">
      <p className="kicker">THE DOCUMENTATION</p>
      <nav aria-label="Documentation sections">
        {links.map(([href, label]) => (
          <Link
            key={href}
            href={href}
            aria-current={pathname === href ? 'page' : undefined}
          >
            {label}
            {pathname === href && <span aria-hidden="true">↗</span>}
          </Link>
        ))}
      </nav>
      <div className="sidebar-note">
        <Brand small />
        <p>
          Good things come
          <br />
          in small packages.
        </p>
      </div>
    </aside>
  );
}
