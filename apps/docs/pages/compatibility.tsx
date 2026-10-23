import { Toaster, echo } from 'notia';
export default function Compatibility() {
  return (
    <main>
      <h1>Next.js Pages Router compatibility</h1>
      <button onClick={() => echo.success('Pages Router works')}>
        Show toast
      </button>
      <Toaster />
    </main>
  );
}
