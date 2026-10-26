'use client';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
export function SiteMain({ children }: { children: ReactNode }) {
  const example = usePathname()?.startsWith('/examples/');
  return (
    <main
      id="main"
      aria-label={example ? 'Notification example' : 'Notia website'}
    >
      {children}
    </main>
  );
}
