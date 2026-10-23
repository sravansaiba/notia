import type { Metadata } from 'next';
import { Code } from '../components/code';
export const metadata: Metadata = { title: 'Getting started' };
export default function DocPage() {
  return (
    <>
      <p className="kicker">HELLO, NOTIA.</p>
      <h1 className="doc-title">Up and toasting.</h1>
      <p>Add a Toaster once. Call Notia wherever your client code lives.</p>
      <div className="release-notice">
        <span aria-hidden="true">◉</span> Notia 0.1.1 is being prepared under
        the new package name. Install it after publication. The original package
        was published as @sravan_saiba/echo.
      </div>
      <Code text="npm install notia" label="1. Install · after publication" />
      <Code
        label="2. Mount once · app/layout.tsx"
        text={`import type { ReactNode } from 'react';\nimport { Toaster } from 'notia';\nimport 'notia/styles.css';\n\nexport default function Layout({ children }: { children: ReactNode }) {\n  return (\n    <html lang="en">\n      <body>\n        {children}\n        <Toaster position="bottom-right" theme="system" />\n      </body>\n    </html>\n  );\n}`}
      />
      <Code
        label="3. Call from client code"
        text={`'use client';\nimport { notia } from 'notia';\n\nexport function SaveButton() {\n  return (\n    <button onClick={() => notia.success('Saved')}>\n      Save changes\n    </button>\n  );\n}`}
      />
      <p className="docs-tip">
        Using Vite? Put <code>&lt;Toaster /&gt;</code> near your app root and
        import the stylesheet once. For Next.js Pages Router, use{' '}
        <code>pages/_app.tsx</code>. Toast calls work in browser utilities too;
        server-side calls are inert.
      </p>
      <h2>Moving from Echo?</h2>
      <p>
        Install <code>notia</code> and update your import paths. The primary API
        is now <code>notia</code>; <code>echo</code> remains a compatibility
        alias. Existing CSS variables keep their <code>--echo-</code> prefix.
      </p>
      <Code
        label="Migration"
        text={['npm uninstall @sravan_saiba/echo', 'npm install notia'].join(
          String.fromCharCode(10),
        )}
      />
    </>
  );
}
