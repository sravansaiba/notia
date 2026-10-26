import type { Metadata } from 'next';
import { Code } from '../../components/code';
export const metadata: Metadata = { title: 'Release notes' };
export default function DocPage() {
  return (
    <>
      <p className="kicker">RELEASE NOTES</p>
      <h1 className="doc-title">Notia 0.2.0</h1>
      <p>
        Interactive notifications for React and Next.js. Explore the guides for
        complete, working examples.
      </p>
      <h2>Feedback you can act on.</h2>
      <p>
        Action and cancel buttons with async error recovery, progress
        notifications, custom icons, optional expandable stacks, and RTL support
        with translatable controls. Existing methods keep working and no runtime
        dependencies are added.
      </p>
      <Code label="Install Notia" text="npm install notia@0.2.0" />
      <h2>Notia 0.1.1 · published</h2>
      <p>
        Published on 23 October 2026. Expressive toast notifications for React
        and Next.js, with no extra runtime dependencies.
      </p>
      <h2>Small package. Ready for your app.</h2>
      <p>
        Success, error, info, warning, loading, and promise notifications. Six
        positions, light and dark themes, keyboard controls, and reduced-motion
        support. TypeScript declarations and ESM/CJS builds are included.
      </p>
      <Code label="Install Notia" text="npm install notia" />
      <p>
        Supports React 18.3 and React 19. MIT licensed. Created by Sravan Saiba.{' '}
        <a href="https://www.npmjs.com/package/notia">
          View the package on npm ↗
        </a>
      </p>
    </>
  );
}
