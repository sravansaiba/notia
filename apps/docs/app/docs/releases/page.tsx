import type { Metadata } from 'next';
import { Code } from '../../components/code';
export const metadata: Metadata = { title: 'Release notes' };
export default function DocPage() {
  return (
    <>
      <h1 className="doc-title">Built carefully. Released deliberately.</h1>
      <p>
        Notia v0.1.1 prepares the move from the published @sravan_saiba/echo
        package to the unscoped notia name. Publication follows package,
        integration, accessibility, and browser verification. Development
        diagnostics are planned for a later version.
      </p>
      <p>MIT licensed. Created by Sravan Saiba.</p>
      <h2>A shorter name. The same care.</h2>
      <p>
        Notia is an invented brand inspired by notifications. It has no claimed
        Japanese etymology. The new name is a separate npm package; the original
        scoped release remains available.
      </p>
      <Code
        label="After the new package is published"
        text={'npm install notia'}
      />
    </>
  );
}
