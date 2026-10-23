# Notia — proposed product and build plan

Status: implementation authorized. The user delegated product and implementation decisions on 23 October 2026; continue through the complete v0.1 build and verification without phase-by-phase approval. Publish only after testing and release review.
Updated: 23 October 2026.

This revises the supplied brief. Adopt the focused v0.1 scope and modern visual direction below. Keep the user informed at meaningful milestones; no additional runtime dependencies or release scope expansion without approval.

## 1. Product direction

Notia is an expressive, accessible toast library for React, with verified Next.js integration. It should feel distinctive, take minutes to adopt, and behave predictably under real application conditions.

Brand: Notia, an invented name inspired by notifications. npm package: `notia`, version `0.1.1`. Tagline: “Toasts that talk back.”

Visual recommendation: clean modern cards, restrained color, crisp typography, and a short fading echo ripple on entry. Use monospace selectively for technical details in future developer tools. The animation must respect reduced motion and remain optional. Avoid continuous motion.

The first release earns trust through its core experience. Optional development diagnostics follow in a separate release and entry point.

## 2. Release boundaries

### v0.1 — a complete, focused toast library

All the core points from our original discussion remain included:

- Simple typed API: success, error, info, warning, loading, promise updates, update by ID, dismiss by ID, and dismiss all.
- Good behavior: stacking, a bounded queue, configurable visible limit, predictable timing, and explicit duplicate prevention.
- Accessibility: screen reader announcements, keyboard access, focus behavior, reduced motion, and tested color contrast.
- Styling control: precompiled CSS, documented CSS variables, light/dark/system modes, custom classes, and custom React content. No Tailwind requirement for consumers.
- Distinctive visual design: a subtle echo entry animation and polished default styling.
- Easy adoption: TypeScript declarations, installation examples, API documentation, and an interactive demo.
- React and Next.js support: test Vite, Next.js App Router, and Next.js Pages Router using the actual packed package.

Also retained from the supplied core brief: six positions, close controls, swipe dismissal, hover/focus/tab-visibility timer pauses, and calls from browser utilities outside React components.

### v0.2 — optional basic development diagnostics

- Separate development entry point, `notia/dev`.
- Browser runtime errors and unhandled promise rejections, grouped into diagnostic toasts.
- Expandable error details and a redacted “Copy for bug report” action.
- Optional console.error interception, disabled by default.
- Mount/unmount cleanup, Strict Mode and hot reload checks, and protection against reporting Notia's own errors recursively.
- Production exclusion verified before this feature is released.

These diagnostics only observe errors available to browser listeners. They do not replace React error boundaries or framework error overlays, or promise to capture server errors or every React error.

### v0.3 or later

- Fetch diagnostics and carefully scoped request reproduction.
- History drawer, search, and filtering.
- Additional visual themes, a Tailwind preset, and other framework adapters only when justified by demand.

Fetch interception, copy-as-cURL, Storybook, and a history drawer do not block v0.1. The playground serves as the initial component workshop.

## 3. Core behavior contract

- Mount one Toaster per browser application in v0.1. Multiple independent toaster instances are outside scope.
- Each creation method returns a string toast ID. Supplying an existing ID updates that toast instead of creating a duplicate, including while queued. Do not merge unrelated messages merely because their text matches.
- Default position: bottom-right. Default visible limit: 3. Default duration: 4 seconds for non-loading toasts, configurable globally and per toast. Loading toasts remain until updated or dismissed.
- Queue: FIFO, with a default maximum of 20 waiting toasts. When full, discard the oldest queued toast before adding another. The visible limit and queue capacity are configurable positive integers.
- Queued toasts do not start their dismissal clock until visible. Dismissal removes visible or queued entries. Dismiss-all clears both.
- Pause the remaining duration on hover, keyboard focus within a toast, and when the document is hidden. Resume only after all pause reasons clear.
- Updating content preserves remaining duration. Changing type or supplying a duration resets the timer; a loading-to-success/error transition starts the resolved toast's duration. Moving an entry through dismissal animation must not revive it accidentally.
- Promise handling updates the same ID through loading and settlement. Return a Promise with the original fulfillment value or rejection so callers can still await and handle errors. Document this explicitly and test it.
- Swipe dismissal works with pointer input, respects scroll intent, and has a close-button alternative.
- Escape dismisses the focused toast when focus is inside it; avoid a page-wide Escape listener that competes with dialogs. Restore focus only when a focused toast is removed, without stealing focus from elsewhere.
- Browser calls outside React are supported. Creating toasts from Server Components, server actions, SSR rendering, or module initialization is unsupported; server execution must not populate shared user-visible state. Browser calls before Toaster mounts enter the bounded queue.
- Custom React content follows the same layout and lifecycle. Consumers remain responsible for accessible labels on their custom controls.

## 4. Public API shape

Selected package name: `notia`, prepared as version `0.1.1`. A direct npm registry lookup returned HTTP 404 on 23 October 2026. The original `@sravan_saiba/echo@0.1.0` is published; the new name is a separate registry package. New code uses `notia`; `echo` remains a compatibility alias.

```tsx
import { Toaster, notia } from 'notia';
import 'notia/styles.css';

<Toaster position="bottom-right" theme="system" maxVisible={3} />;

notia.success('Changes saved');
notia.error('Could not save', { id: 'save-error' });

const id = notia.loading('Uploading…');
notia.update(id, { type: 'success', message: 'Uploaded' });
notia.dismiss(id);
notia.dismissAll();

const user = await notia.promise(fetchUser(), {
  loading: 'Loading user…',
  success: (user) => `Welcome, ${user.name}`,
  error: 'Could not load user',
});
```

In Next.js, toast calls belong in client code. The root layout may render the exported client Toaster. Validate this against the built package, including preservation of the client directive.

## 5. Accessibility and rendering requirements

- Use stable polite and assertive announcement regions. Routine messages are polite; reserve assertive announcements for appropriate errors. Avoid announcing the same toast twice or putting interactive controls in the announcement text.
- Toast creation never moves focus. Close controls have accessible names, visible focus, and adequate target sizes.
- Support long text, narrow viewports, zoom, and reduced motion. Meaning must not depend on color alone.
- Use immutable, cached store snapshots. Supply a stable empty server snapshot and matching initial hydration snapshot.
- Do not access browser globals at module import or during server rendering. Initialize browser listeners and rendering effects on the client and clean them up.
- Keep timers, queue transitions, and exit animation cleanup separate enough to test reliably.

## 6. Architecture and tooling

```text
packages/echo/src/
  core/       store, IDs, queue, timers
  react/      Toaster and toast rendering
  styles/     compiled CSS and variables
apps/docs/    Next.js documentation and playground
tests/        integration fixtures and browser checks
```

Future diagnostics live in a separate dev module with no reverse imports from the main entry point.

- TypeScript strict mode; React and ReactDOM as external peer dependencies where used. No additional runtime dependencies without approval.
- A small custom store using useSyncExternalStore. No state management library initially.
- pnpm workspaces; defer Turborepo until task orchestration needs it.
- Next.js and plain CSS for the docs. This avoids adding a styling tool solely for the playground. Use the playground for visual iteration initially.
- Vitest, React Testing Library, accessibility automation, and Playwright where they verify meaningful behavior.
- ESLint, Prettier, Changesets, GitHub Actions, and bundle measurement. Local Git hooks are optional convenience; CI enforces required checks.
- Start with tsup as proposed, subject to the Phase 1 compatibility spike. Prove ESM, CJS, declarations, CSS exports, and client directive preservation before building features. Replace it only if that spike reveals a concrete issue.
- Explicit exports and publishable files; preserve CSS through the sideEffects configuration. Verify consumers use one store across the documented import paths.
- Choose and document supported React/Next.js versions from tested versions during Phase 1; do not promise untested version ranges.

## 7. Corrected diagnostics isolation policy

The supplied brief asks for complete production removal, a production warning, and a forceEnable option. These cannot all describe code that has been completely removed.

Recommended policy for the future diagnostics release:

- No production forceEnable option. Production entry resolves to an inert stub; rich diagnostics are unreachable in tested production builds.
- Main entry never imports diagnostics. Importing a module alone never patches globals.
- Prove exclusion for both normal core imports and accidental diagnostics imports in the supported production fixture builds. Check module graphs and emitted assets for diagnostic implementation markers, then verify runtime inactivity. A tiny stub may remain; do not label that as literally zero bytes.
- Test both publication artifacts and consumer builds. An environment check by itself is insufficient evidence of removal.
- Unknown environment behavior fails closed. Document the exact bundler/environment support verified by the fixtures.
- Global interception is explicitly enabled, idempotent, and restorable. Teardown restores globals only when Notia still owns the installed wrapper; test coexistence with another wrapper.
- Never suppress native error reporting. Avoid duplicate reporting across event sources, console wrapping, and Notia's own UI.
- Keep diagnostic data local, bounded, and ephemeral. Capture no request/response bodies by default. Prefer an allowlist for metadata, strip URL credentials, queries, and fragments by default, and permit user-provided sanitization. Pattern-based redaction cannot guarantee removal of every secret in arbitrary error text; preview copied reports and document this limit.
- Future fetch tooling must preserve Request/Response semantics and cancellation. Aborted requests are not automatically errors. Do not consume application streams or claim to reconstruct cookies or headers inaccessible to JavaScript.

## 8. Build phases and acceptance gates

Proceed through the approved scope autonomously, reporting milestones and acceptance results. Work in small reviewable steps, test meaningful behavior alongside implementation, and use Conventional Commit messages when commits are requested.

1. **Foundation and packaging spike.** Establish workspace, basic checks, package exports, and minimal fixtures. Select tested compatibility versions, verify publish access to the selected npm scope, and select a license. Gate: a packed placeholder package imports correctly in all three consumer fixtures, includes CSS and declarations, and preserves Next.js client boundaries. No publishing yet.
2. **Core engine.** Implement API, immutable store, explicit-ID deduplication, bounded FIFO queue, timer semantics, and promise lifecycle. Gate: meaningful tests for all lifecycle transitions, races, cleanup, and at least 90% core branch and line coverage.
3. **React and visual experience.** Implement one polished design, six positions, themes, echo animation, swipe, close controls, announcements, and focus behavior. Gate: review the live playground; pass behavior tests, accessibility automation, manual keyboard and screen reader checks, reduced-motion and mobile layout checks.
4. **Documentation and framework validation.** Add install guide, API reference, promise error handling, styling examples, Next.js recipes, limitations, and a working interactive playground. Gate: consumer builds and hydration checks pass using the packed package in Vite and both Next.js routers.
5. **Release hardening.** Verify packed files, imports, declarations, CSS retention, bundle size, E2E behavior, license, README, demo recording, changelog, and release workflow. Gate: review the exact release package and deployed-site preview.
6. **v0.1 release.** Publish the approved package version and deploy the approved docs site using the user's npm and hosting accounts. Verify the public install and links. Account access and release actions are handled when concrete artifacts are ready.
7. **Diagnostics planning.** After v0.1, review feedback and approve the v0.2 design, especially production module resolution and interception behavior, before implementing it.

## 9. Size and completion criteria

- Aim for at most 4 KB gzip for a production-minified representative core + React consumer bundle, excluding React/ReactDOM and CSS. Track CSS separately. Establish the measurement in Phase 1 and assess feasibility after Phase 3; do not drop accessibility to meet an arbitrary byte count. Any budget adjustment needs review.
- Zero additional runtime dependencies; peer dependencies and development dependencies are reported separately.
- Strict public types with no any, passing core coverage gates, automated checks, and manual accessibility verification. Automated accessibility checks alone do not prove accessibility.
- Published package, deployed docs/playground, working clean-install examples, README with demo and truthful badges, changelog, license, and a short design write-up.
- Main package contains no diagnostics in v0.1. Rich production-exclusion tests become a release requirement when the diagnostics entry is introduced.

## 10. Adopted decisions

1. Core in v0.1, basic diagnostics in v0.2, network tools later.
2. Clean modern visual direction with a subtle echo ripple.
3. Final name: `notia`, version `0.1.1`. Public registry lookup returned HTTP 404 on 23 October 2026. The user will publish manually. Keep the published scoped package available for existing users.
4. MIT license. The user delegated these implementation decisions.

## Reference checks

- React store and hydration requirements: https://react.dev/reference/react/useSyncExternalStore
- Next.js client boundaries and library author guidance: https://nextjs.org/docs/app/getting-started/server-and-client-components
- Next.js environment variable behavior: https://nextjs.org/docs/pages/guides/environment-variables

These references support the SSR/client-boundary review. Production stripping still requires the actual package and consumer-build tests described above.

## Website routes

The home, playground, installation docs, API reference, styling, accessibility, and release notes use separate routes. Docs and Playground appear in the shared header with active-page indicators. The playground is compact on desktop and scrolls naturally on mobile. No Japanese etymology is claimed for Notia.
