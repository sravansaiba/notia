'use client';
import { notia } from 'notia';
import { ExampleToaster as Toaster } from '../app/components/example-toaster';
import 'notia/styles.css';
export default function Example() {
  return (
    <>
      <button
        onClick={() =>
          notia.success('A little personality.', { icon: <span>✦</span> })
        }
      >
        Show custom icon
      </button>
      <button
        onClick={() => notia.info('The message is enough.', { icon: null })}
      >
        Show text only
      </button>
      <Toaster
        label="Example notifications"
        theme="system"
        icons={{ success: <span>✦</span> }}
      />
    </>
  );
}
