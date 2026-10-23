# Notia

**Toasts that talk back.** Expressive, accessible notifications for React and Next.js, with a subtle echo animation and no additional runtime dependencies.

> v0.1.1: Notia is moving from `@sravan_saiba/echo` to the shorter, unscoped name `notia`. The new installation command works once this package is published.

## Install

```sh
npm install notia
```

If you installed the original package, run `npm uninstall @sravan_saiba/echo` and then install `notia`. Replace JavaScript imports with `'notia'` and stylesheet imports with `'notia/styles.css'`. Use `notia` and `Toaster` for new integrations. The exported `echo` API remains as a compatibility alias of `notia`; existing CSS tokens and classes retain their `echo` prefix.

React and ReactDOM are peer dependencies. Notia supports React 18.3 and React 19; the repository's compatibility checks install and test both major versions from the package tarball.

## Quick start

```tsx
import { Toaster, notia } from 'notia';
import 'notia/styles.css';

export default function App() {
  return (
    <>
      <button onClick={() => notia.success('Changes saved')}>Save</button>
      <Toaster position="bottom-right" theme="system" />
    </>
  );
}
```

Mount one Toaster near the application root. Calls from browser utilities, event handlers, and API clients work too. Calls before the Toaster mounts enter a bounded queue. Server-side calls are inert and do not accumulate notifications across requests.

## API

```tsx
notia.success('Saved', { description: 'Your work is up to date.' });
notia.error('Could not save');
notia.info('An update is available');
notia.warning('You have unsaved changes');

const id = notia.loading('Uploading…');
notia.update(id, { type: 'success', message: 'Uploaded' });
notia.dismiss(id);
notia.dismissAll();
```

Creation methods return a string ID. An explicit `id` prevents duplicates by updating the existing visible or queued toast. Identical text with different IDs remains separate. Updating an unknown or already dismissing ID does nothing.

```tsx
notia.error('Could not save', { id: 'save-error' });
```

### Promises

`notia.promise` returns a Promise with the original value or rejection. Continue to handle errors in your application.

```tsx
try {
  const user = await notia.promise(fetchUser(), {
    loading: 'Loading user…',
    success: (user) => `Welcome, ${user.name}`,
    error: (error) =>
      error instanceof Error ? error.message : 'Could not load user',
  });
  // Use user here.
} catch (error) {
  // Handle the original failure.
}
```

Dismissed promise toasts are not recreated when their promise settles. Message formatter functions should return content without throwing.

### Toast options

| Option         | Default      | Behavior                                                      |
| -------------- | ------------ | ------------------------------------------------------------- |
| `id`           | Generated    | Reuse an ID to update instead of duplicate.                   |
| `duration`     | 4000         | Milliseconds. `Infinity` persists; `0` dismisses immediately. |
| `description`  | None         | Optional React content below the message.                     |
| `announcement` | Message text | Plain text for screen readers; provide for JSX content.       |
| `className`    | None         | A class on the toast card.                                    |
| `dismissible`  | `true`       | Show close control and allow Escape/swipe dismissal.          |

Loading toasts always persist until updated or dismissed. Programmatic dismissal works even with `dismissible: false`.

`notia.update(id, changes)` accepts the above options except `id`, plus `message` and `type`.

### Toaster props

| Prop                 | Default         | Values                                                                                |
| -------------------- | --------------- | ------------------------------------------------------------------------------------- |
| `position`           | `bottom-right`  | `top-left`, `top-center`, `top-right`, `bottom-left`, `bottom-center`, `bottom-right` |
| `theme`              | `system`        | `light`, `dark`, `system`                                                             |
| `maxVisible`         | 3               | Positive integer                                                                      |
| `maxQueued`          | 20              | Positive integer                                                                      |
| `duration`           | 4000            | Default duration in milliseconds, or `Infinity`                                       |
| `label`              | `Notifications` | Accessible region name                                                                |
| `className`, `style` | None            | Style the notification container                                                      |

Queue order is FIFO. The oldest waiting entry is discarded when the waiting queue is full. Queue timers start on visibility. Existing visible toasts retain their original timing when global defaults change; per-toast updates can change their timing explicitly.

Hover, keyboard focus inside a toast, window blur, and hidden tabs pause the remaining duration. All pause reasons must clear before resuming. Content-only updates preserve time; a supplied type or duration starts a fresh timer. Exit animation takes 180ms before a queue slot is released.

### Custom content

```tsx
notia.success(<strong>Ready to go</strong>, {
  announcement: 'Ready to go',
  description: 'Your export is available.',
});
```

Custom controls need accessible names. Keep important actions available elsewhere in your application too.

## Next.js

In the App Router, render the client Toaster from your root layout. The published JavaScript preserves its `use client` directive.

```tsx
// app/layout.tsx
import type { ReactNode } from 'react';
import { Toaster } from 'notia';
import 'notia/styles.css';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
```

Call `echo` from files with `'use client'` or their client-side dependencies, not Server Components, server actions, SSR render functions, or module initialization.

In the Pages Router, import the stylesheet and render `<Toaster />` in `pages/_app.tsx`.

## Styling

No Tailwind configuration or animation library is required. Set a class on your Toaster and override CSS variables:

```tsx
<Toaster className="my-toaster" theme="dark" />
```

```css
.my-toaster {
  --echo-radius: 16px;
  --echo-width: 380px;
  --echo-gap: 12px;
  --echo-offset: 24px;
}
```

Color tokens: `--echo-bg`, `--echo-text`, `--echo-muted`, `--echo-border`, `--echo-success`, `--echo-error`, `--echo-info`, `--echo-warning`. Shadow: `--echo-shadow`.

To disable animations explicitly:

```css
.echo-toast,
.echo-toast::before,
.echo-icon--loading {
  animation: none;
}
```

Animations are automatically disabled when `prefers-reduced-motion: reduce` is active.

## Accessibility

- Routine messages use polite announcements; errors use an assertive region.
- Notification creation never takes focus.
- Close buttons are keyboard accessible. Escape dismisses the focused toast, without a page-wide Escape listener.
- Timers pause during focus and hover. Use persistent durations for information users need more time to read.
- Icons and text distinguish notification types without relying only on color.
- Swipe dismissal has a close-button alternative.

Automated accessibility checks cannot replace testing with assistive technology in your application. Custom themes and custom JSX can affect accessibility.

## Scope

v0.1 focuses on the toast experience. No error interception, request inspection, analytics, network requests, or diagnostic collection is included. Optional development diagnostics are planned separately.

## License

MIT © 2026 Sravan Saiba
