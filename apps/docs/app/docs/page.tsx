import type { Metadata } from 'next';
import Link from 'next/link';
import { LiveExample } from '../components/live-example';
export const metadata: Metadata = { title: 'Welcome to Notia' };
export default function DocPage() {
  return (
    <>
      <p className="kicker">SMALL NOTIFICATIONS. CLEAR FEEDBACK.</p>
      <h1 className="doc-title">A little guidance. Then you’re building.</h1>
      <p className="doc-lead">
        Notia adds small, interactive notification messages to React and Next.js
        apps. Confirm a save, explain a problem, undo a change, or show the
        progress of a task.
      </p>
      <div className="guide-cards">
        {[
          [
            '/docs/setup',
            '01',
            'Install & set up',
            'Choose your framework and show your first message.',
          ],
          [
            '/docs/actions',
            '02',
            'Add an Undo button',
            'Make a change and let people reverse it.',
          ],
          [
            '/docs/progress',
            '03',
            'Show upload progress',
            'Keep a task’s percentage in one notification.',
          ],
          [
            '/playground',
            '↗',
            'Try the playground',
            'Explore the options before copying your code.',
          ],
        ].map(([href, number, title, description]) => (
          <Link key={href} href={href!}>
            <small>{number}</small>
            <strong>{title}</strong>
            <span>{description}</span>
          </Link>
        ))}
      </div>
      <h2>See what a toast does</h2>
      <p>
        Read the code, then click Show success below it. The notification
        appears on this website. Reset clears the example and its notifications.
      </p>
      <LiveExample name="success" title="Your first notification" />
      <h2>Pick the right feedback</h2>
      <p>
        Use success after work finishes, error when something fails, information
        for an update, and warning when something needs attention. Use loading
        or progress while work is happening.
      </p>
      <p>
        You don’t need advanced React knowledge to follow these guides, but you
        do need a React application. Every feature includes working JavaScript
        and TypeScript, a live example, and an explanation of what to expect.
      </p>
    </>
  );
}
