'use client';
import { notia } from 'notia';
import { ExampleToaster as Toaster } from '../app/components/example-toaster';
import 'notia/styles.css';
export default function Example() {
  return (
    <>
      <button
        onClick={() =>
          notia.info('Your report is ready.', {
            description: 'You can download it from your dashboard.',
          })
        }
      >
        Show info
      </button>
      <Toaster label="Example notifications" theme="system" />
    </>
  );
}
