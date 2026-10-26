# notia

## 0.2.0

### Minor Changes

- Add async action and cancel buttons with retryable error handling, persistent progress notifications, per-toast and per-type custom icons, optional expandable stacks with paused hidden timers, and RTL support with translatable control labels. Preserve existing notification APIs and styling compatibility. Refresh compact actions, status accents, and progress motion. Keep action focus through exit so keyboard focus can return to its trigger.

## 0.1.1 — 23 October 2026

- Move the package from `@sravan_saiba/echo` to the unscoped name `notia`.
- Update installation instructions, imports, workspace links, and packed-package compatibility checks for the new name.
- Expose `notia` as the primary API and retain `echo` as a compatibility alias; Toaster and styling tokens remain compatible.
- Split the website into focused home, playground, and documentation routes.
- Guard playground input until hydration completes and cover delayed loading in the browser tests.

Published on npm as `notia@0.1.1`.

## 0.1.0 — published as @sravan_saiba/echo on 23 October 2026

- Typed success, error, info, warning, loading, promise, update, and dismissal APIs.
- Bounded FIFO queue, explicit-ID deduplication, and pause-aware timers.
- Six positions, light/dark/system themes, CSS variables, and custom React content.
- Echo ripple animation, reduced motion, keyboard and swipe dismissal.
- Screen reader announcements and server-safe React/Next.js integration.
- No additional runtime dependencies.
