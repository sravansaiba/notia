export const guideGroups = [
  {
    title: 'Start here',
    items: [
      ['/docs', 'Welcome to Notia'],
      ['/docs/setup', 'Install & set up'],
      ['/docs/first-toast', 'Your first notification'],
    ],
  },
  {
    title: 'Show notifications',
    items: [
      ['/docs/success', 'Success messages'],
      ['/docs/error', 'Error messages'],
      ['/docs/info', 'Information'],
      ['/docs/warning', 'Warnings'],
      ['/docs/loading', 'Loading states'],
      ['/docs/promises', 'Waiting for a task'],
    ],
  },
  {
    title: 'Add interactions',
    items: [
      ['/docs/actions', 'Buttons & Undo'],
      ['/docs/progress', 'Upload progress'],
      ['/docs/icons', 'Custom icons'],
      ['/docs/stacks', 'Stacked notifications'],
    ],
  },
  {
    title: 'Make it yours',
    items: [
      ['/docs/position', 'Position & timing'],
      ['/docs/styling', 'Colors & dark mode'],
      ['/docs/rtl', 'Languages & direction'],
    ],
  },
  {
    title: 'Get help',
    items: [
      ['/docs/troubleshooting', 'Fix common problems'],
      ['/docs/accessibility', 'Keyboard & screen readers'],
      ['/docs/api', 'All settings'],
      ['/docs/releases', "What's new"],
    ],
  },
] as const;
export const guideLinks = guideGroups.flatMap((group) =>
  group.items.map(([href, title]) => ({ href, title })),
);
export type ExampleName =
  | 'success'
  | 'error'
  | 'info'
  | 'warning'
  | 'loading'
  | 'promises'
  | 'actions'
  | 'progress'
  | 'icons'
  | 'stacks'
  | 'rtl';
export interface Guide {
  title: string;
  intro: string;
  when: string;
  example: ExampleName;
  result: string;
  notes: string[];
}
export const guides: Record<string, Guide> = {
  'first-toast': {
    title: 'Your first notification',
    intro:
      'A toast is a small message that confirms something happened without interrupting the page.',
    when: 'Use it after a button click or a completed task. Keep important information in the page too.',
    example: 'success',
    result:
      'Click Show success. A success message appears, then closes after four seconds.',
    notes: [
      'Install Notia and mount one Toaster before using this example.',
      'Call notia inside an event handler. Calling it while rendering creates repeated notifications.',
    ],
  },
  success: {
    title: 'Success messages',
    intro: 'Confirm that an action finished successfully.',
    when: 'Use after saving, sending, or creating something. Say what happened in a few words.',
    example: 'success',
    result:
      'Your work, saved. appears with a success icon and an optional second line.',
    notes: [
      'Show success after your request succeeds, rather than when it starts.',
      'The returned ID lets you update or dismiss this specific message.',
    ],
  },
  error: {
    title: 'Error messages',
    intro: 'Explain what went wrong and give people a useful next step.',
    when: 'Use for a failed request. Keep form validation next to the affected field.',
    example: 'error',
    result: 'An error notification appears with a suggestion to try again.',
    notes: [
      'Errors use an assertive screen reader announcement. Avoid repeated error messages.',
      'For a retry button and automatic action error handling, see Buttons & Undo.',
    ],
  },
  info: {
    title: 'Information',
    intro: 'Share a useful update without asking for immediate action.',
    when: 'Use for a report that is ready or a change made by a teammate.',
    example: 'info',
    result: 'An information message appears and closes automatically.',
    notes: [
      'Use duration: Infinity only when the message must stay until dismissed.',
      'A toast is temporary feedback, not a permanent notification inbox.',
    ],
  },
  warning: {
    title: 'Warnings',
    intro:
      'Point out something that deserves attention before the user continues.',
    when: 'Use for unsaved changes or an approaching limit. Critical decisions belong in a dialog.',
    example: 'warning',
    result: 'A warning message explains that changes have not been saved.',
    notes: [
      'Do not rely on the icon or color alone: explain the warning in text.',
      'Keep destructive confirmations in your application interface.',
    ],
  },
  loading: {
    title: 'Loading states',
    intro: 'Keep one message visible while your application is working.',
    when: 'Use when you control the start and finish of a task. Use Waiting for a task for a single Promise.',
    example: 'loading',
    result:
      'Start the task, then click Finish task. The same notification changes from loading to success.',
    notes: [
      'Loading messages never expire automatically. Update their type or dismiss them when work ends.',
      'Reusing an ID updates the existing notification instead of adding another.',
    ],
  },
  promises: {
    title: 'Waiting for a task',
    intro:
      'A Promise represents work that will finish later, such as saving a file. Notia follows that work for you.',
    when: 'Use one loading, success, and error message for a single asynchronous task.',
    example: 'promises',
    result:
      'The simulated save takes one second. Select Simulate an error to try the failure path.',
    notes: [
      'notia.promise returns the original result and preserves rejection. Keep your try/catch.',
      'The example simulates a request. Replace the Promise with your actual API call.',
    ],
  },
  actions: {
    title: 'Buttons & Undo',
    intro: 'Give people a next step directly inside a notification.',
    when: 'Use Undo after a reversible action, Retry after a failed request, or Cancel to dismiss an offer.',
    example: 'actions',
    result:
      'Delete the sample file. It disappears from the page. Click Undo in the notification to restore it.',
    notes: [
      'The example changes local state only. Connect deletion and restoration to your own storage or API.',
      'Actions dismiss after success. Set dismiss: false to keep the notification.',
      'Async actions pause the timer and prevent duplicate clicks. A rejected action shows errorMessage and stays available to retry.',
      'Remove an action with action: null. A Cancel button uses the same options under cancel.',
    ],
  },
  progress: {
    title: 'Upload progress',
    intro:
      'Update one notification as a task moves from zero to one hundred percent.',
    when: 'Use when your upload or background task provides real progress updates.',
    example: 'progress',
    result:
      'Start the simulated upload, move its slider, then complete or cancel it. No file is sent.',
    notes: [
      'Notia displays progress; it does not upload files. Feed it values from your upload implementation.',
      'Reaching 100 does not finish a loading toast. Explicitly change the type to success or error.',
      'Cancel must also stop your actual task, for example with AbortController. This example has no network task.',
      'Use progress: undefined to remove the bar. Values are displayed between 0 and 100.',
    ],
  },
  icons: {
    title: 'Custom icons',
    intro:
      'Use your own React element, keep the default icon, or show text alone.',
    when: 'Use a small SVG or a component from your existing icon library. No extra dependency is required.',
    example: 'icons',
    result: 'Show a star icon or a message without an icon.',
    notes: [
      'A per-message icon overrides the Toaster icons setting.',
      'Set icon: null or icon: false to hide the icon. Icons are decorative; keep the meaning in the message.',
      'For global defaults, set icons={{ success: <span>✦</span> }} on your existing Toaster.',
    ],
  },
  stacks: {
    title: 'Stacked notifications',
    intro:
      'Keep busy moments compact and let people expand the active messages when they need them.',
    when: 'Enable expandable on your existing Toaster. The default is an ordinary list.',
    example: 'stacks',
    result:
      'Show three notifications. Hover or focus a card to expand, or use the button to pin the stack open.',
    notes: [
      'Hidden cards keep their remaining time and cannot receive keyboard focus.',
      'Reading an expanded stack pauses timers. Moving away collapses an unpinned stack.',
      'maxVisible controls the visible group. Additional notifications wait in the bounded queue.',
      'This shows active notifications, not a saved notification history.',
    ],
  },
  rtl: {
    title: 'Languages & direction',
    intro:
      'Translate notification messages and controls. Japanese uses left-to-right layout; test mirrored layout separately with the RTL option.',
    when: 'Use dir and lang on your existing Toaster. Position names always refer to the physical edge of the screen.',
    example: 'rtl',
    result:
      'A Japanese notification appears with translated controls. Enable the RTL test to mirror its layout; the website keeps its normal direction.',
    notes: [
      'Translate the message and the labels separately. Direction does not translate text.',
      'The Toaster is mounted in the document body. Pass dir explicitly when testing a different direction.',
      'Translate labels.dismiss, expand, collapse, progress, and actionError, plus the region label.',
    ],
  },
};
