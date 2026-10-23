# Contributing to Notia

Thanks for helping improve Notia. Bug reports, documentation improvements, and focused pull requests are welcome.

## Local setup

Use Node.js 22.14+ within 22.x, Node.js 24, or Node.js 26+, and pnpm 10.30.3. Run these commands from the repository root:

```sh
pnpm install --frozen-lockfile
pnpm build:lib
pnpm dev
```

Open [localhost:3000](http://127.0.0.1:3000). The docs consume the built library; run `pnpm build:lib` again after editing library code.

## Repository layout

| Location        | Purpose                                                           |
| --------------- | ----------------------------------------------------------------- |
| `packages/echo` | Published `notia` library, package README, license, and changelog |
| `apps/docs`     | Next.js website and playground                                    |
| `tests/unit`    | Store, React, and server-rendering tests                          |
| `tests/e2e`     | Production browser and accessibility checks                       |
| `scripts`       | Package, consumer compatibility, and release checks               |
| `.changeset`    | Release notes awaiting versioning                                 |
| `docs`          | Architecture, deployment, and release guides                      |

The library's directory name is internal; imports and npm installation use `notia`.

## Report a bug

Open an issue with the expected and actual behavior, a minimal reproduction, and your Notia, React, framework, and browser versions. For visual issues, include a screenshot when useful.

For substantial new features, open an issue describing the use case before implementation so contributors can agree on scope and API behavior.

## Submit a pull request

Keep each pull request focused. Update documentation and examples when behavior changes. Add regression coverage for bugs and meaningful tests for new behavior. Explain the user-visible change and how you verified it in the pull request description.

Library changes should include a Changeset. Run `pnpm changeset` from the repository root, select `notia`, choose the appropriate bump, and describe the change for users. Maintainers apply versions during release preparation. Website-only and contributor-documentation changes do not need an npm release.

## Run checks

Install browser runtimes once, then run the full gate from the repository root:

```sh
pnpm exec playwright install chromium firefox webkit
pnpm run verify
```

On Linux CI, use `pnpm exec playwright install --with-deps chromium firefox webkit` to install system dependencies too.

| Command                    | What it checks                                                         |
| -------------------------- | ---------------------------------------------------------------------- |
| `pnpm test:coverage`       | Unit/component/server tests and coverage thresholds                    |
| `pnpm typecheck`           | Library, website, and test types                                       |
| `pnpm lint`                | Lint rules                                                             |
| `pnpm format:check`        | Formatting; use `pnpm format` to apply it                              |
| `pnpm run build`           | Production library and website builds                                  |
| `pnpm check:release-tools` | Changesets configuration and changelog adapter                         |
| `pnpm check:package`       | Built exports, client directive, contents, and size budget             |
| `pnpm test:compat`         | Packed-package React, Vite, Next.js, ESM/CJS, types, and SSR consumers |
| `pnpm test:e2e`            | Browser behavior and automated accessibility                           |

Build before running package or browser checks individually. The complete `verify` command handles the required order. Core line and branch coverage thresholds are 90%. The package check enforces a 4096-byte gzipped JavaScript budget, excluding React/ReactDOM; CSS is measured separately.

Browser tests launch a fresh production server on port 3100 and refuse to reuse an existing server. Keep that port free. Tests use one worker because timer-pause checks depend on window focus. The mobile project emulates a viewport; it is not a physical-device test.

If rebuilding while a preview server is running, stop and restart the preview afterward to avoid stale Next.js manifests.

## Reports and accessibility

Generated files belong in ignored report directories:

- `coverage/`: coverage report and summary.
- `playwright-report/`: browser HTML report; open with `pnpm exec playwright show-report`.
- `test-results/`: failure screenshots and traces.
- `artifacts/`: package measurements, isolated consumers, and captured media.

GitHub CI uploads reports as workflow artifacts. Check the run for the relevant commit; a local pass does not establish hosted CI success. Avoid committing generated reports or copying changing test counts into permanent documentation.

Review keyboard access, timer pauses, long messages, touch dismissal, and reduced motion when changing notification behavior. Test announcements with a real screen reader: automated accessibility checks do not prove actual speech behavior or accessibility of custom consumer content.

## Maintainer guides

- [Architecture](docs/architecture.md)
- [Website deployment](docs/deploying.md)
- [Versioning and npm releases](docs/releasing.md)
