import type { Metadata } from 'next';
import { Code } from '../../components/code';
export const metadata: Metadata = { title: 'All settings' };
export default function DocPage() {
  return (
    <>
      <h1 className="doc-title">All settings</h1>
      <p>
        Every method and option in one place. For step-by-step working examples,
        choose a feature in the sidebar.
      </p>
      <div
        className="table-scroll"
        tabIndex={0}
        role="region"
        aria-label="Methods table"
      >
        <table>
          <caption className="sr-only">Notia API methods</caption>
          <thead>
            <tr>
              <th>Method</th>
              <th>What it does</th>
            </tr>
          </thead>
          <tbody>
            {[
              [
                'notia.success(message, options?)',
                'Celebrate a completed action. Returns a toast ID.',
              ],
              [
                'notia.error(message, options?)',
                'Surface a problem with an assertive announcement.',
              ],
              ['notia.info(message, options?)', 'Share a useful update.'],
              [
                'notia.warning(message, options?)',
                'Flag something that needs attention.',
              ],
              [
                'notia.loading(message, options?)',
                'Stay visible until updated or dismissed.',
              ],
              [
                'notia.progress(message, options?)',
                'Track a percentage with one persistent notification.',
              ],
              [
                'notia.promise(promise, messages, options?)',
                'Update one toast through loading and settlement. Return the original result or rejection.',
              ],
              [
                'notia.update(id, changes)',
                'Update content, type, or options without creating a toast.',
              ],
              [
                'notia.dismiss(id)',
                'Dismiss a visible or queued notification.',
              ],
              ['notia.dismissAll()', 'Clear visible and queued notifications.'],
            ].map(([method, description]) => (
              <tr key={method}>
                <td>
                  <code>{method}</code>
                </td>
                <td>{description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Code
        label="IDs · duplicates · custom content"
        text={`const id = notia.loading('Uploading…');\nnotia.update(id, { type: 'success', message: 'Uploaded' });\n\n// Same ID updates the existing toast.\nnotia.error('Could not save', { id: 'save-error' });\n\n// Give custom JSX a plain-text announcement.\nnotia.info(<strong>Ready to go</strong>, {\n  announcement: 'Ready to go',\n  duration: Infinity,\n});`}
      />
      <Code
        label="Promises · keep your error handling"
        text={`// Simulated data; replace with your actual request.\nasync function loadUser() { return { name: 'Sam' }; }\n\ntry {\n  const user = await notia.promise(loadUser(), {\n    loading: 'Loading…',\n    success: (user) => 'Welcome, ' + user.name,\n    error: 'Could not load user',\n  });\n  // Use user here.\n} catch (error) {\n  // notia.promise preserves rejection for your app to handle.\n}`}
      />
      <h2>Toaster options</h2>
      <p>
        <code>position</code>: six positions, default bottom-right.{' '}
        <code>theme</code>: light, dark, or system. <code>maxVisible</code>: 3.{' '}
        <code>maxQueued</code>: 20. <code>duration</code>: 4000ms. Also accepts{' '}
        <code>className</code>, <code>style</code>, and a region{' '}
        <code>label</code>. Also accepts: <code>icons</code>,{' '}
        <code>expandable</code>, <code>dir</code>, <code>lang</code>, and{' '}
        <code>labels</code>.
      </p>
      <h2>Per-toast options</h2>
      <p>
        <code>id</code>, <code>duration</code>, <code>description</code>,{' '}
        <code>announcement</code>, <code>className</code>, and{' '}
        <code>dismissible</code>. Use <code>Infinity</code> for a persistent
        toast. Loading always persists until updated or dismissed. Also accepts:{' '}
        <code>action</code>, <code>cancel</code>, <code>icon</code>,{' '}
        <code>progress</code>, and <code>progressLabel</code>.
      </p>
      <h2>Actions and recoverable errors</h2>
      <Code
        label="Action and cancel buttons"
        text={`// Simulates saving. Replace with your actual request.\nasync function saveDraft() {\n  await new Promise(resolve => setTimeout(resolve, 1000));\n}\n\nnotia.info('Save your draft?', {
  action: {
    label: 'Save',
    onClick: async (id) => { await saveDraft(); },
    errorMessage: 'Could not save. Try again.',
  },
  cancel: { label: 'Cancel', onClick: () => {} },
});`}
      />
      <p>
        Actions dismiss on success by default. Set <code>dismiss: false</code>{' '}
        to keep the notification. Pending actions pause the timer and ignore
        duplicate clicks. Rejections and synchronous throws update the same
        toast to an error and leave the action available to retry. Use{' '}
        <code>errorMessage</code> or <code>labels.actionError</code> to
        translate failures. Use <code>action: null</code> or{' '}
        <code>cancel: null</code> to remove a button.
      </p>
      <h2>Progress you control</h2>
      <Code
        label="Progress lifecycle"
        text={`const id = notia.progress('Uploading…', {
  progress: 0, progressLabel: 'File upload',
});
notia.update(id, { progress: 64 });
notia.update(id, {
  type: 'success', message: 'Uploaded', progress: 100,
});`}
      />
      <p>
        Progress notifications are persistent loading toasts. Reaching 100 does
        not imply your task succeeded: explicitly update the type when your
        application finishes or fails. The displayed value is clamped to 0–100;
        non-finite values display zero. Set <code>progress: undefined</code> to
        remove the bar. Percentage changes do not repeatedly announce the
        message.
      </p>
      <h2>Expandable stacks</h2>
      <Code
        label="Optional compact stack"
        text={`<Toaster expandable maxVisible={3} />`}
      />
      <p>
        The first visible notification stays at the front. Other visible cards
        are hidden until you hover, focus a card, or use the expand button.
        Hidden cards pause their timers and their controls are removed from
        keyboard navigation. Reading an expanded stack pauses all notification
        timers. A button can pin the stack open; moving away collapses an
        unpinned stack. Queue limits and FIFO ordering stay unchanged. This is a
        compact view of active notifications, not a notification history.
      </p>
      <h2>Container settings</h2>
      <div
        className="table-scroll"
        tabIndex={0}
        role="region"
        aria-label="Container settings table"
      >
        <table>
          <caption className="sr-only">Container settings</caption>
          <thead>
            <tr>
              <th>Option</th>
              <th>Type</th>
              <th>Default</th>
              <th>Meaning</th>
            </tr>
          </thead>
          <tbody>
            {[
              [
                'position',
                'six position strings',
                'bottom-right',
                'Physical screen edge.',
              ],
              [
                'theme',
                'light | dark | system',
                'system',
                'System follows the browser color preference.',
              ],
              [
                'duration',
                'number (milliseconds)',
                '4000',
                'Default time for non-loading messages. Infinity keeps a message open.',
              ],
              ['maxVisible', 'number', '3', 'Maximum active group size.'],
              [
                'maxQueued',
                'number',
                '20',
                'Maximum waiting messages. Oldest waiting entry is discarded when full.',
              ],
              [
                'expandable',
                'boolean',
                'false',
                'Enable the compact active stack.',
              ],
              [
                'icons',
                'Partial<Record<ToastType, ReactNode>>',
                'built-in SVGs',
                'Per-type icon defaults. Override a single message with icon.',
              ],
              [
                'dir / lang',
                'ltr | rtl / language code',
                'document direction / language',
                'Set direction and pronunciation explicitly for localized sections.',
              ],
              ['label', 'string', 'Notifications', 'Accessible region name.'],
              [
                'labels',
                'Partial<ToasterLabels>',
                'English controls',
                'Translate dismiss, expand, collapse, progress, and actionError.',
              ],
              [
                'className / style',
                'string / CSSProperties',
                'none',
                'Style the portal region.',
              ],
            ].map(([option, type, fallback, description]) => (
              <tr key={option}>
                <td>
                  <code>{option}</code>
                </td>
                <td>{type}</td>
                <td>{fallback}</td>
                <td>{description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <h2>Message settings</h2>
      <div
        className="table-scroll"
        tabIndex={0}
        role="region"
        aria-label="Message settings table"
      >
        <table>
          <caption className="sr-only">Message settings</caption>
          <thead>
            <tr>
              <th>Option</th>
              <th>Type</th>
              <th>Default</th>
              <th>Meaning</th>
            </tr>
          </thead>
          <tbody>
            {[
              [
                'id',
                'string',
                'generated',
                'Same ID updates an existing message.',
              ],
              ['description', 'ReactNode', 'none', 'Optional supporting line.'],
              [
                'duration',
                'number',
                'Toaster duration',
                'Override reading time. Loading stays persistent.',
              ],
              [
                'announcement',
                'string',
                'plain-text message and description',
                'Supply plain text when your visual content is JSX.',
              ],
              [
                'dismissible',
                'boolean',
                'true',
                'Allow close, scoped Escape, and swipe dismissal.',
              ],
              [
                'action / cancel',
                'ToastAction | null',
                'none',
                'Action button label, onClick(id), dismiss, and errorMessage.',
              ],
              [
                'icon',
                'ReactNode',
                'type default',
                'null or false hides the icon.',
              ],
              [
                'progress',
                'number | undefined',
                'none',
                'Percentage display; undefined removes it.',
              ],
              [
                'progressLabel',
                'string',
                'labels.progress',
                'Accessible task name for the progress bar.',
              ],
              ['className', 'string', 'none', 'Style this visual card.'],
            ].map(([option, type, fallback, description]) => (
              <tr key={option}>
                <td>
                  <code>{option}</code>
                </td>
                <td>{type}</td>
                <td>{fallback}</td>
                <td>{description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <h2>Updating a message</h2>
      <p>
        notia.update(id, changes) accepts message options except id, plus type
        and message. Updates to unknown, dismissed, or leaving IDs are ignored.
        It returns nothing. The six creation methods return a string ID;
        notia.promise returns your original task’s result or rejection.
      </p>
      <h2>Action settings</h2>
      <p>
        label is the button text. onClick receives the notification ID and may
        return a Promise. dismiss defaults to true after success. errorMessage
        overrides the default action failure message. Both action and cancel use
        this shape.
      </p>{' '}
      <h2>Predictable behavior</h2>
      <p>
        Timers pause on hover, keyboard focus, window blur, and hidden tabs.
        Queued toasts start their timer when shown. Updating content preserves
        the remaining time; supplying a type or duration resets it. When the
        waiting queue is full, its oldest entry is discarded. Mount one Toaster
        per application.
      </p>
    </>
  );
}
