'use client';
import { notia } from 'notia';
import { ExampleToaster as Toaster } from '../app/components/example-toaster';
import 'notia/styles.css';
export default function Example() {
  return (
    <>
      <button
        onClick={() =>
          notia.success('Your work, saved.', {
            description: 'One less thing to think about.',
          })
        }
      >
        Show success
      </button>
      <Toaster label="Example notifications" theme="system" />
    </>
  );
}
