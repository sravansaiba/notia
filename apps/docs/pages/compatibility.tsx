import { Toaster, notia } from 'notia';
export default function Compatibility() {
  return (
    <main>
      <h1>Next.js Pages Router compatibility</h1>
      <button onClick={() => notia.success('Pages Router works')}>
        Show toast
      </button>
      <Toaster />
    </main>
  );
}
