'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Code } from './code';
const react = `import { notia, Toaster } from 'notia';
import 'notia/styles.css';

export default function App() {
  return (
    <>
      <button onClick={() => notia.success('Your first notification!')}>
        Show a notification
      </button>
      <Toaster theme="system" />
    </>
  );
}`;
const next = `import type { ReactNode } from 'react';
import { Toaster } from 'notia';
import 'notia/styles.css';

export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="en"><body>{children}<Toaster theme="system" /></body></html>;
}`;
const pages = `import type { AppProps } from 'next/app';
import { Toaster } from 'notia';
import 'notia/styles.css';

export default function App({ Component, pageProps }: AppProps) {
  return <><Component {...pageProps} /><Toaster theme="system" /></>;
}`;
const button = `'use client';
import { notia } from 'notia';

export default function Page() {
  return <button onClick={() => notia.success('Your first notification!')}>Show a notification</button>;
}`;
export function SetupGuide() {
  const [framework, setFramework] = useState('react');
  return (
    <>
      <p className="kicker">START HERE</p>
      <h1 className="doc-title">Install & set up</h1>
      <p className="doc-lead">
        Add Notia to an existing React or Next.js application. You need Node.js,
        a package manager, and a project that already runs in your browser.
      </p>
      <p>
        No project yet? Start with the official{' '}
        <a href="https://react.dev/learn/creating-a-react-app">
          React setup guide
        </a>{' '}
        or{' '}
        <a href="https://nextjs.org/docs/app/getting-started/installation">
          Next.js setup guide
        </a>
        .
      </p>
      <h2>1. Install the package</h2>
      <p>
        Open your terminal in the folder containing your app’s package.json.
        Choose your package manager:
      </p>
      <Code text="npm install notia" label="npm" />
      <details>
        <summary>Using pnpm or Yarn?</summary>
        <Code text="pnpm add notia" label="pnpm" />
        <Code text="yarn add notia" label="Yarn" />
      </details>
      <h2>2. Choose your project</h2>
      <label className="framework-picker">
        Your framework
        <select
          value={framework}
          onChange={(event) => setFramework(event.target.value)}
        >
          <option value="react">React / Vite</option>
          <option value="next">Next.js App Router</option>
          <option value="pages">Next.js Pages Router</option>
        </select>
      </label>
      <p>
        The Toaster is the container that displays notifications. Mount it once,
        and import its stylesheet once.
      </p>
      {framework === 'react' ? (
        <Code text={react} javascript={react} label="src/App.tsx" />
      ) : framework === 'next' ? (
        <>
          <Code
            text={next}
            javascript={next
              .replace("import type { ReactNode } from 'react';\n", '')
              .replace(': { children: ReactNode }', '')}
            label="app/layout.tsx"
          />
          <h2>3. Show a notification</h2>
          <p>
            Use a client component for buttons and browser events. Your root
            layout can stay a server component.
          </p>
          <Code text={button} javascript={button} label="app/page.tsx" />
        </>
      ) : (
        <>
          <Code
            text={pages}
            javascript={pages
              .replace("import type { AppProps } from 'next/app';\n", '')
              .replace(': AppProps', '')}
            label="pages/_app.tsx"
          />
          <h2>3. Show a notification</h2>
          <Code
            text={button.replace("'use client';\n", '')}
            javascript={button.replace("'use client';\n", '')}
            label="pages/index.tsx"
          />
        </>
      )}
      <h2>Check it works</h2>
      <p>
        Start your app’s development server and open its local address. Click
        Show a notification. You should see “Your first notification!” in the
        bottom-right corner.
      </p>
      <p className="docs-tip">
        Keep the Toaster mounted during navigation. Don’t place a second one
        inside a page or feature component. Server-side toast calls do not
        display notifications.
      </p>
      <p>
        <Link href="/docs/first-toast">Next: your first notification →</Link>
      </p>
    </>
  );
}
