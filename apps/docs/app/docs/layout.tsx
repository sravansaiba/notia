import type { ReactNode } from 'react';
import { DocsPagination } from '../components/docs-pagination';
import { DocsNav } from '../components/docs-nav';

export default function DocsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="documentation section-width">
      <DocsNav />
      <article className="docs-content">
        {children}
        <DocsPagination />
      </article>
    </div>
  );
}
