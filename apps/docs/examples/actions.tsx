'use client';
import { useEffect, useRef, useState } from 'react';
import { notia } from 'notia';
import { ExampleToaster as Toaster } from '../app/components/example-toaster';
import 'notia/styles.css';
export default function Example() {
  const active = useRef(true);
  useEffect(() => {
    active.current = true;
    return () => {
      active.current = false;
    };
  }, []);
  const [deleted, setDeleted] = useState(false);
  function removeFile() {
    if (deleted) return;
    setDeleted(true);
    notia.success('File moved to trash.', {
      id: 'file-delete',
      duration: Infinity,
      action: {
        label: 'Undo',
        onClick: () => {
          setDeleted(false);
        },
      },
    });
  }
  function retryDemo() {
    let attempts = 0;
    notia.info('Save your draft.', {
      duration: Infinity,
      action: {
        label: 'Save draft',
        errorMessage: 'Connection lost. Try again.',
        onClick: async () => {
          // Simulates a request that fails once, then succeeds.
          await new Promise((resolve) => setTimeout(resolve, 1000));
          if (!active.current) return;
          if (attempts++ === 0) throw new Error('Simulated failure');
          notia.success('Draft saved.');
        },
      },
      cancel: { label: 'Cancel', onClick: () => {} },
    });
  }
  return (
    <>
      <p aria-live="polite">
        {deleted ? 'The folder is empty.' : 'File: project-notes.txt'}
      </p>
      <button aria-disabled={deleted} onClick={removeFile}>
        Delete sample file
      </button>
      <button onClick={retryDemo}>Try a failed action</button>
      <Toaster label="Example notifications" theme="system" />
    </>
  );
}
