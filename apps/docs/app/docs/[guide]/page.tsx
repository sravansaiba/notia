import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { guides } from '../../lib/guides';
import { LiveExample } from '../../components/live-example';
import { SetupGuide } from '../../components/setup-guide';
import { Code } from '../../components/code';
const special = ['setup', 'position', 'troubleshooting'];
export function generateStaticParams() {
  return [...Object.keys(guides), ...special].map((guide) => ({ guide }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ guide: string }>;
}): Promise<Metadata> {
  const { guide } = await params;
  return {
    title:
      guides[guide]?.title ||
      (
        {
          setup: 'Install & set up',
          position: 'Position & timing',
          troubleshooting: 'Fix common problems',
        } as Record<string, string>
      )[guide] ||
      'Guide',
  };
}
export default async function GuidePage({
  params,
}: {
  params: Promise<{ guide: string }>;
}) {
  const { guide: slug } = await params;
  if (slug === 'setup') return <SetupGuide />;
  if (slug === 'position')
    return (
      <>
        <p className="kicker">MAKE IT YOURS</p>
        <h1 className="doc-title">Position & timing</h1>
        <p>
          Choose where feedback appears and how long people have to read it.
          Apply these settings to your existing Toaster.
        </p>
        <Code
          label="Toaster settings"
          text={
            '<Toaster position="bottom-right" duration={4000} maxVisible={3} maxQueued={20} />'
          }
          javascript={
            '<Toaster position="bottom-right" duration={4000} maxVisible={3} maxQueued={20} />'
          }
        />
        <h2>Choose an edge</h2>
        <p>
          Use top-left, top-center, top-right, bottom-left, bottom-center, or
          bottom-right. These are physical positions, including in right-to-left
          layouts.
        </p>
        <h2>Give people time</h2>
        <p>
          Duration is in milliseconds: 4000 means four seconds. Override one
          message with its duration option. Use Infinity to keep it visible
          until dismissed. Loading messages stay until updated or dismissed.
        </p>
        <h2>Busy moments</h2>
        <p>
          By default, three cards can be visible and twenty can wait. Queued
          messages start their timers when shown. If the queue fills up, the
          oldest waiting message is discarded.
        </p>
        <p>
          Timers pause on hover, keyboard focus, hidden tabs, and window blur.
          Content-only updates preserve remaining time; supplying a type or
          duration resets it.
        </p>
        <Link href="/playground">Try the positions in the playground →</Link>
      </>
    );
  if (slug === 'troubleshooting')
    return (
      <>
        <p className="kicker">GET HELP</p>
        <h1 className="doc-title">Fix common problems</h1>
        {[
          [
            'Nothing appears',
            'Mount one Toaster in the same browser application, import notia/styles.css, and call notia from a click handler or completed request. Server-side calls intentionally do nothing.',
          ],
          [
            'The message looks unstyled',
            'Import notia/styles.css once in App or the root layout. Check that your application CSS is not overriding the notification classes.',
          ],
          [
            'A loading message never closes',
            'Loading and progress notifications are persistent. Keep the returned ID, then call notia.update(id, { type: "success", message: "Done" }) or notia.dismiss(id).',
          ],
          [
            'A button or function is missing',
            'Check your installed version with npm ls notia. The interaction features require Notia 0.2.0 or later. Restart your development server after updating.',
          ],
          [
            'There are duplicate messages',
            'Avoid calling notia during render. Use a stable id to update an existing notification. Development Strict Mode can rerun effects; event handlers are usually a clearer place for user feedback.',
          ],
          [
            'More than one Toaster is mounted',
            'Mount one Toaster per application. The full documentation examples include a Toaster for standalone use. Remove it when copying a feature into an app that already has one.',
          ],
          [
            'An action failed',
            'Async action errors keep the button available to retry. Provide errorMessage. For notia.promise, retain try/catch because your original rejection is preserved.',
          ],
          [
            'Can I use it without React?',
            'Notia supports React 18.3 and React 19, including Next.js. A plain HTML, Vue, or Svelte application needs a separate adapter.',
          ],
        ].map(([title, text]) => (
          <section key={title}>
            <h2>{title}</h2>
            <p>{text}</p>
          </section>
        ))}
        <p>
          Still stuck?{' '}
          <a href="https://github.com/sravansaiba/notia/issues">
            Open an issue with a small reproduction
          </a>
          .
        </p>
      </>
    );
  if (!Object.hasOwn(guides, slug)) notFound();
  const guide = guides[slug];
  if (!guide) notFound();
  return (
    <>
      <p className="kicker">NOTIA / GUIDES</p>
      <h1 className="doc-title">{guide.title}</h1>
      <p className="doc-lead">{guide.intro}</p>
      <h2>When to use it</h2>
      <p>{guide.when}</p>
      <p className="docs-tip">
        New here? <Link href="/docs/setup">Install & set up</Link> first. The
        example below is a complete component you can try on its own.
      </p>
      <LiveExample name={guide.example} title={guide.title} />
      <h2>What you should see</h2>
      <p>{guide.result}</p>
      <h2>How to use it correctly</h2>
      <ul className="guide-notes">
        {guide.notes.map((note) => (
          <li key={note}>{note}</li>
        ))}
      </ul>
      <p>
        <Link href="/docs/api">See every option in All settings →</Link>
      </p>
    </>
  );
}
