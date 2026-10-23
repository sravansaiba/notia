import type { ReactNode } from 'react';
import { DocsNav } from '../components/docs-nav';

export default function DocsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="documentation section-width">
      <DocsNav />
      <article className="docs-content">{children}</article>
    </div>
  );
}
