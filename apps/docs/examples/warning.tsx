'use client';
import { notia } from 'notia';
import { ExampleToaster as Toaster } from '../app/components/example-toaster';
import 'notia/styles.css';
export default function Example() {
  return (
    <>
      <button
        onClick={() =>
          notia.warning('You have unsaved changes.', {
            description: 'Save your work before leaving this page.',
          })
        }
      >
        Show warning
      </button>
      <Toaster label="Example notifications" theme="system" />
    </>
  );
}
