import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import 'notia/styles.css';
import './globals.css';
import Link from 'next/link';
import { Header } from './components/header';
import { Brand } from './components/brand';
import { SiteMain } from './components/site-main';
import { Providers } from './components/providers';

export const metadata: Metadata = {
  title: { default: 'Notia — Toasts that talk back.', template: '%s — Notia' },
  description:
    'Expressive, accessible toast notifications for React and Next.js. A little feedback. A lasting impression.',
};
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t='light';try{if(localStorage.getItem('notia-theme')==='dark')t='dark'}catch(e){}document.documentElement.dataset.theme=t})()`,
          }}
        />
      </head>
      <body>
        <Providers>
          <a className="skip-link" href="#main">
            Skip to content
          </a>
          <Header />
          <SiteMain>{children}</SiteMain>
          <footer className="site-footer section-width">
            <Link href="/" aria-label="Notia home">
              <Brand small />
            </Link>
            <p>Small notifications. Clear feedback.</p>
            <a href="https://www.npmjs.com/package/notia">View on npm ↗</a>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
