import type { Metadata } from 'next';
import { Code } from '../../components/code';
export const metadata: Metadata = { title: 'Styling and themes' };
export default function DocPage() {
  return (
    <>
      <h1 className="doc-title">Your product. Your personality.</h1>
      <p>
        Notia ships with its own CSS. Override variables using a class on your
        Toaster; no Tailwind or animation library needed.
      </p>
      <Code
        label="CSS variables"
        text={`.my-toaster {\n  --echo-bg: #22232b;\n  --echo-text: #f5f5f8;\n  --echo-muted: #b5b6c3;\n  --echo-border: #41424e;\n  --echo-info: #b5aeff;\n  --echo-radius: 16px;\n  --echo-width: 380px;\n  --echo-gap: 12px;\n  --echo-offset: 24px;\n}`}
      />
      <p>
        Other tokens: <code>--echo-success</code>, <code>--echo-error</code>,{' '}
        <code>--echo-warning</code>, and <code>--echo-shadow</code>. Set{' '}
        <code>animation: none</code> on <code>.echo-toast</code> and{' '}
        <code>.echo-toast::before</code> to disable the entry effect. Set it on{' '}
        <code>.echo-icon--loading</code> as well to stop the spinner.
      </p>
    </>
  );
}
