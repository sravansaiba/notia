'use client';
import { notia } from 'notia';
import { ExampleToaster as Toaster } from '../app/components/example-toaster';
import 'notia/styles.css';
export default function Example() {
  return (
    <>
      <button
        onClick={() =>
          notia.error('Could not save.', {
            description: 'Check your connection and try again.',
          })
        }
      >
        Show error
      </button>
      <Toaster label="Example notifications" theme="system" />
    </>
  );
}
