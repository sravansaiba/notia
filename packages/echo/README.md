# Notia

**Toasts that talk back.** Expressive, accessible notifications for React and Next.js, with subtle layered animations and no additional runtime dependencies.

Available on npm as [`notia`](https://www.npmjs.com/package/notia).

## Install

```sh
npm install notia
```

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

## New in 0.2.0

### Action and cancel buttons

```tsx
notia.info('Save this draft?', {
  action: {
    label: 'Save',
    onClick: async (id) => {
      await saveDraft();
    },
    errorMessage: 'Could not save. Try again.',
  },
  cancel: { label: 'Cancel', onClick: () => {} },
});
```

`action` and `cancel` accept a text `label`, an `onClick(id)` callback, optional `dismiss` (default `true`), and optional `errorMessage`. Callbacks may return a promise. Pending buttons keep keyboard focus, pause their toast's timer, and ignore repeated clicks. A successful action dismisses its toast unless `dismiss: false`. A thrown error or rejected promise changes the same toast into an error and leaves the action available for retry; customize the message per action or with `labels.actionError`. Old callbacks cannot change a replacement notification after dismissal.

Set `action: null` or `cancel: null` through `notia.update()` to remove a button. If a focused action removes itself, focus moves to the close control when one is present. As with other custom content, keep essential actions available elsewhere in your app.

### Progress notifications

```tsx
const id = notia.progress('Uploading…', {
  progress: 0,
  progressLabel: 'File upload',
});
notia.update(id, { progress: 64 });
notia.update(id, {
  type: 'success',
  message: 'Uploaded',
  progress: 100,
});
```

`notia.progress()` creates a persistent loading notification, starting at zero. The displayed percentage is clamped to 0–100; non-finite values display zero. Reaching 100 does not automatically finish the task. Explicitly set a success/error type when your application settles, or dismiss it. Set `progress: undefined` to remove the bar. Percentage-only updates do not repeat the live announcement.

### Custom icons

```tsx
<Toaster icons={{ success: <BrandIcon />, loading: <Spinner /> }} />;

notia.success('Saved', { icon: <CheckIcon /> });
notia.info('Text only', { icon: null });
```

A per-toast `icon` overrides the Toaster's icon for its type. `null` or `false` hides the icon. Icons are decorative and hidden from assistive technology; put meaningful text in the message or `announcement`, and keep interactive controls outside the icon slot.

### Expandable stacks

```tsx
<Toaster expandable maxVisible={3} />
```

This is opt-in; the default layout is unchanged. A collapsed stack shows the first visible notification and an expand button. Other cards pause their timers and their controls stay out of keyboard navigation. Hover or keyboard focus on a card expands the stack; the button can pin it open. Expanded stacks pause all timers while being read. Leaving an unpinned stack collapses it. FIFO ordering and queue capacity are unchanged. This is a compact view of active notifications, not an archive of dismissed ones.

### RTL and translated controls

```tsx
<Toaster
  dir="rtl"
  lang="ar"
  label="الإشعارات"
  labels={{
    dismiss: 'إغلاق الإشعار',
    expand: 'عرض الإشعارات',
    collapse: 'طي الإشعارات',
    progress: 'تقدم الرفع',
    actionError: 'تعذر تنفيذ الإجراء. حاول مجدداً.',
  }}
/>
```

Without `dir`, the Toaster inherits the document's direction. The portal attaches to the document body; pass `dir` for an RTL section inside an LTR document. Text, action order, progress origin, and exit motion follow direction. Position names are physical: `top-left` stays on the left in both directions. Use `progressLabel` for a task-specific accessible progress name.

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

Additional options in 0.2.0: `action`, `cancel`, `icon`, `progress`, and `progressLabel`, described above.

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

Additional Toaster props in 0.2.0: `icons` (per-type defaults), `expandable` (default `false`), `dir` (`ltr` or `rtl`, otherwise inherited), `lang` (notification language), and `labels` (translated control text). Exported types include `ToastAction`, `ToastIcons`, and `ToasterLabels`.

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

Call `notia` from files with `'use client'` or their client-side dependencies, not Server Components, server actions, SSR render functions, or module initialization.

In the Pages Router, import the stylesheet and render `<Toaster />` in `pages/_app.tsx`.

## Styling

Import `notia/styles.css` once. Choose `light`, `dark`, or `system` with the Toaster's `theme` prop. No styling framework or animation library is required.

```tsx
<Toaster theme="system" style={{ fontFamily: 'inherit', zIndex: 10000 }} />
```

Add a class to customize individual notifications:

```tsx
notia.success('Made it yours.', { className: 'product-toast' });
```

Load your overrides after the Notia stylesheet. Repeating the class supplies enough specificity for every notification type:

```css
.product-toast.product-toast {
  border-radius: 18px;
  border-color: #9470d8;
  box-shadow: 0 8px 28px #25123b18;
}
```

Check text contrast when changing colors. Animations are automatically disabled when `prefers-reduced-motion: reduce` is active.

## Accessibility

- Routine messages use polite announcements; errors use an assertive region.
- Notification creation never takes focus.
- Close buttons are keyboard accessible. Escape dismisses the focused toast, without a page-wide Escape listener.
- Timers pause during focus and hover. Use persistent durations for information users need more time to read.
- Icons and text distinguish notification types without relying only on color.
- Swipe dismissal has a close-button alternative.

Automated accessibility checks cannot replace testing with assistive technology in your application. Custom themes and custom JSX can affect accessibility.

## Scope

Notia focuses on toast notifications. It does not intercept errors, inspect requests, collect analytics, or make network requests.

## License

MIT © 2026 Sravan Saiba
