'use client';
import { useState } from 'react';
import { notia } from 'notia';
import { ExampleToaster as Toaster } from '../app/components/example-toaster';
import 'notia/styles.css';
export default function Example() {
  const [fail, setFail] = useState(false);
  const [busy, setBusy] = useState(false);
  async function save() {
    setBusy(true);
    try {
      // Replace this simulated request with your own API call.
      await notia.promise(
        new Promise<string>((resolve, reject) => {
          setTimeout(
            () => (fail ? reject(new Error('Demo failure')) : resolve('Saved')),
            1000,
          );
        }),
        {
          loading: 'Saving…',
          success: 'Changes saved.',
          error: 'Could not save. Try again.',
        },
      );
    } catch {
      // Notia displays the error. Handle application recovery here.
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <label>
        <input
          type="checkbox"
          checked={fail}
          onChange={(event) => setFail(event.target.checked)}
        />{' '}
        Simulate an error
      </label>
      <button disabled={busy} onClick={save}>
        Save changes
      </button>
      <Toaster label="Example notifications" theme="system" />
    </>
  );
}
