import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Accessibility' };
export default function DocPage() {
  return (
    <>
      <h1 className="doc-title">Feedback without friction.</h1>
      <p>
        Notifications do not take focus. Tab to the close button; Escape
        dismisses the toast while focus is inside it. Swipe horizontally to
        dismiss on touch screens. Hover or focus pauses the timer.
        Reduced-motion settings disable all animation.
      </p>
      <p>
        Routine messages use polite announcements; errors use assertive
        announcements. Provide <code>announcement</code> when using JSX. Give
        your own interactive content accessible names and keep important actions
        available elsewhere in your app.
      </p>
    </>
  );
}
