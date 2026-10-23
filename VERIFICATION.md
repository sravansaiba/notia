# Notia v0.1.1 verification

The complete `pnpm verify` gate passed on 23 October 2026. The original `@sravan_saiba/echo@0.1.0` is published. The new `notia@0.1.1` package is prepared locally; npm publication and public documentation deployment remain pending.

| Check                                | Result                                                                |
| ------------------------------------ | --------------------------------------------------------------------- |
| Unit/component/server tests          | 41 passed                                                             |
| Browser suite                        | 57 passed; 3 intentionally skipped                                    |
| Core coverage                        | 100% lines; 97.75% branches                                           |
| Overall instrumented coverage        | 92.95% lines; 86.16% branches                                         |
| Browser engines                      | Chromium, Firefox, WebKit; mobile Chromium viewport                   |
| Accessibility automation             | No violations on tested routes and light/dark persistent-toast states |
| Packed React consumers               | React 18.3.1 and React 19.3.1 passed                                  |
| Packed framework consumers           | Vite 8.3.5 and Next.js 16.4.2 App/Pages Routers passed                |
| ESM/CJS/declarations/SSR             | Passed against the tarball                                            |
| Production library/docs builds       | Passed                                                                |
| Type checking, lint, formatting      | Passed                                                                |
| Package content and client directive | Passed                                                                |
| Additional runtime dependencies      | None                                                                  |
| JavaScript gzip size                 | 3,055 bytes; React/ReactDOM excluded                                  |
| CSS gzip size                        | 1,505 bytes, reported separately                                      |
| Dependency audit                     | No known advisories at the time of verification                       |
| Changesets configuration and adapter | Passed                                                                |
| Packed identity                      | notia@0.1.1; notia-0.1.1.tgz                                          |

The three skips are mobile hover and duplicate route-markup scans in Firefox/WebKit. Every toast interaction runs in all four browser projects. The documentation route scans run in desktop and mobile Chromium.

## Website and migration checks

Home, Playground, Getting started, API reference, Styling, Accessibility, and Release notes have separate routes. Tests cover header navigation, active-page indicators, documentation links, direct loading/reloading, one main heading per page, and horizontal overflow. Desktop/mobile screenshots were reviewed and the README demo was refreshed.

The primary `notia` API and compatibility `echo` export share the same lifecycle, covered by a component regression test. Packed consumers exercise the new package name and canonical API. Existing CSS variables and classes keep their echo prefix for compatibility.

Browser checks also exercise queue capacity, repeated IDs, long messages, promise success/rejection, all positions, themes, hover pauses, focus restoration, keyboard dismissal, horizontal pointer swipe, reduced motion, and framework hydration. The mobile viewport is not a physical-device test.

## Test reliability and regression coverage

Focus-sensitive browser tests run with one foreground browser at a time. Accessibility scans use persistent notifications to avoid sampling an intentional exit fade. Restricted Windows sessions use an unchanged copy of the official Firefox runtime in the writable test workspace; the npm library contains no such workaround.

Browser tests start their own fresh production server on port 3100 and refuse to reuse an existing server. This avoids stale Next.js build manifests from a preview left running during a rebuild. Hydration tests attach their error listeners before their first navigation, avoiding canceled preload requests from an unrelated setup page while retaining the assertion that page errors are absent.

The custom-message input remains disabled until React can accept input. A regression test deliberately delays JavaScript loading and checks the submitted message. The final gate passes with this protection in every engine.

## Remaining human and public-release checks

- Verify actual announcement speech with a real screen reader; automated checks cannot establish this.
- Complete the user's final product review.
- Connect the intended repository, add real public links, and run hosted CI. Local workflow files do not establish hosted CI success.
- Choose documentation hosting and review its deployment preview.
- Publish manually using PUBLISHING.md, verify a fresh install from npm, and update pending-publication notices after upload.

Coverage and browser HTML reports are generated under coverage/ and playwright-report/. Package contents and size measurements are recorded in artifacts/package-report.json. Re-run the release gate if release files change before publication. Passing tests do not guarantee the absence of every bug.
