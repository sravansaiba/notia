'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { guideLinks } from '../lib/guides';
export function DocsPagination() {
  const pathname = usePathname();
  const index = guideLinks.findIndex((link) => link.href === pathname);
  const previous = guideLinks[index - 1];
  const next = guideLinks[index + 1];
  return (
    <nav className="docs-pagination" aria-label="Guide navigation">
      {previous && (
        <Link href={previous.href}>
          <small>← Previous</small>
          {previous.title}
        </Link>
      )}
      {next && (
        <Link href={next.href}>
          <small>Next →</small>
          {next.title}
        </Link>
      )}
    </nav>
  );
}
