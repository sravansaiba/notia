import type { Metadata } from 'next';
import { Code } from '../../components/code';
export const metadata: Metadata = { title: 'API reference' };
export default function DocPage() {
  return (
    <>
      <h1 className="doc-title">A small API. Plenty to say.</h1>
      <div className="table-scroll">
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
        text={`try {\n  const user = await notia.promise(loadUser(), {\n    loading: 'Loading…',\n    success: (user) => 'Welcome, ' + user.name,\n    error: 'Could not load user',\n  });\n  // Use user here.\n} catch (error) {\n  // notia.promise preserves rejection for your app to handle.\n}`}
      />
      <h2>Toaster options</h2>
      <p>
        <code>position</code>: six positions, default bottom-right.{' '}
        <code>theme</code>: light, dark, or system. <code>maxVisible</code>: 3.{' '}
        <code>maxQueued</code>: 20. <code>duration</code>: 4000ms. Also accepts{' '}
        <code>className</code>, <code>style</code>, and a region{' '}
        <code>label</code>.
      </p>
      <h2>Per-toast options</h2>
      <p>
        <code>id</code>, <code>duration</code>, <code>description</code>,{' '}
        <code>announcement</code>, <code>className</code>, and{' '}
        <code>dismissible</code>. Use <code>Infinity</code> for a persistent
        toast. Loading always persists until updated or dismissed.
      </p>
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
