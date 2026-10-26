'use client';
import { useRef, useState } from 'react';
import { notia } from 'notia';
import { ExampleToaster as Toaster } from '../app/components/example-toaster';
import 'notia/styles.css';
export default function Example() {
  const id = useRef<string | undefined>(undefined);
  const [active, setActive] = useState(false);
  const [value, setValue] = useState(0);
  function start() {
    setValue(0);
    setActive(true);
    id.current = notia.progress('Uploading your file…', {
      progress: 0,
      progressLabel: 'File upload',
      cancel: {
        label: 'Cancel upload',
        dismiss: false,
        onClick: (toastId) => {
          setActive(false);
          notia.update(toastId, {
            type: 'info',
            message: 'Upload canceled.',
            progress: undefined,
            cancel: null,
          });
        },
      },
    });
  }
  function update(next: number) {
    if (!id.current || !active) return;
    setValue(next);
    notia.update(id.current, { progress: next });
  }
  function finish() {
    if (!id.current || !active) return;
    setValue(100);
    setActive(false);
    notia.update(id.current, {
      type: 'success',
      message: 'Upload complete.',
      progress: 100,
      cancel: null,
    });
  }
  return (
    <>
      <p>This is a simulation. No file is uploaded.</p>
      <button disabled={active} onClick={start}>
        Start upload
      </button>
      <label>
        Upload progress: {value}%
        <input
          type="range"
          min={0}
          max={100}
          value={value}
          disabled={!active}
          onChange={(event) => update(Number(event.target.value))}
        />
      </label>
      <button disabled={!active} onClick={finish}>
        Complete upload
      </button>
      <Toaster label="Example notifications" theme="system" />
    </>
  );
}
