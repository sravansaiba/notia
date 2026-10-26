import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Keyboard & screen readers' };
export default function DocPage() {
  return (
    <>
      <h1 className="doc-title">Keyboard & screen readers</h1>
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
      <h2>Interactive feedback</h2>
      <p>
        Action buttons keep their keyboard focus while waiting, pause the
        notification timer, and prevent duplicate activation. Failed actions
        announce an error and stay available to retry. If an action removes
        itself, focus moves to the close control when available.
      </p>
      <p>
        Progress bars have a task label and numeric value. Frequent percentage
        updates do not repeat the live announcement. Collapsed stacks hide
        inactive cards and their controls from assistive technology until
        expanded, while pausing their timers. The expand control works with
        keyboard and touch. Direction and control labels can be localized.
      </p>
      <p>
        Automated checks do not replace testing with real assistive technology.
        Review announcements and custom content in your own application.
      </p>
    </>
  );
}
