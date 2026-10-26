'use client';
import { useEffect, useState } from 'react';
import { notia } from 'notia';
import { Code } from './code';
import { exampleSources } from '../lib/example-sources';
import type { ExampleName } from '../lib/guides';
import Success from '../../examples/success';
import ErrorExample from '../../examples/error';
import Info from '../../examples/info';
import Warning from '../../examples/warning';
import Loading from '../../examples/loading';
import Promises from '../../examples/promises';
import Actions from '../../examples/actions';
import Progress from '../../examples/progress';
import Icons from '../../examples/icons';
import Stacks from '../../examples/stacks';
import Rtl from '../../examples/rtl';
const examples = {
  success: Success,
  error: ErrorExample,
  info: Info,
  warning: Warning,
  loading: Loading,
  promises: Promises,
  actions: Actions,
  progress: Progress,
  icons: Icons,
  stacks: Stacks,
  rtl: Rtl,
};
export function LiveExample({
  name,
  title,
}: {
  name: ExampleName;
  title: string;
}) {
  const [revision, setRevision] = useState(0);
  const source = exampleSources[name];
  const Example = examples[name];
  useEffect(() => () => notia.dismissAll(), [name]);
  return (
    <section className="live-example" aria-label={`${title} example`}>
      <p className="example-placement">
        Use this as <code>App.tsx</code> / <code>App.jsx</code> in React, or{' '}
        <code>app/page.tsx</code> / <code>app/page.jsx</code> in Next.js. If
        your app already has a Toaster, keep that one and copy the notification
        logic into your component.
      </p>
      <Code
        text={source.typescript}
        javascript={source.javascript}
        label="App.tsx"
      />
      <h3 className="demo-heading">See it in action</h3>
      <p className="demo-hint">
        These controls run the code above. Click a button to show a notification
        on this page.
      </p>
      <div className="inline-demo" aria-label={`${title} demo controls`}>
        <Example key={`${name}:${revision}`} />
      </div>
      <button
        className="reset-example"
        onClick={() => {
          notia.dismissAll();
          setRevision((value) => value + 1);
        }}
      >
        Reset example ↻
      </button>
    </section>
  );
}
