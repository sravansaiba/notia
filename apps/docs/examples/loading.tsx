'use client';
import { useRef, useState } from 'react';
import { notia } from 'notia';
import { ExampleToaster as Toaster } from '../app/components/example-toaster';
import 'notia/styles.css';
export default function Example() {
  const id = useRef<string | undefined>(undefined);
  const [running, setRunning] = useState(false);
  function start() {
    id.current = notia.loading('Preparing your report…');
    setRunning(true);
  }
  function finish() {
    if (!id.current) return;
    notia.update(id.current, { type: 'success', message: 'Report ready.' });
    setRunning(false);
  }
  return (
    <>
      <button disabled={running} onClick={start}>
        Start task
      </button>
      <button disabled={!running} onClick={finish}>
        Finish task
      </button>
      <Toaster label="Example notifications" theme="system" />
    </>
  );
}
