'use client';
import { notia } from 'notia';
import { ExampleToaster as Toaster } from '../app/components/example-toaster';
import 'notia/styles.css';
export default function Example() {
  function show() {
    notia.dismissAll();
    ['Report ready.', 'Your teammate left a note.', 'Changes saved.'].forEach(
      (message, index) => {
        notia.info(message, { id: `stack-${index}`, duration: Infinity });
      },
    );
  }
  return (
    <>
      <button onClick={show}>Show a stack</button>
      <p>Hover, focus a card, or use Expand notifications.</p>
      <Toaster
        label="Example notifications"
        theme="system"
        expandable
        maxVisible={3}
      />
    </>
  );
}
