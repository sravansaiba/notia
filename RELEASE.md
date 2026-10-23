# Notia 0.1.1 release checklist

The user requested publication only after the product is fully built and tested. The original @sravan_saiba/echo@0.1.0 is published. The new notia@0.1.1 package and the public website are pending publication/deployment.

## Automated gate

Run `pnpm verify` from the workspace root. Publishing also invokes this gate through the package's prepublishOnly script. Do not bypass lifecycle scripts to publish.

- Build ESM, CJS, type declarations, stylesheet, and production documentation.
- Core line and branch coverage must exceed 90%.
- Pass strict type checking, lint, and formatting checks.
- Pack and inspect the actual npm artifact, including license, README, and changelog.
- JavaScript gzip budget: 4096 bytes, excluding React/ReactDOM and the separately reported CSS.
- Verify the client directive, no runtime dependencies, and no diagnostic interception code.
- Install the tarball in separate React 18 and React 19 consumers; check server rendering, browser use, ESM, CJS, declarations, and Vite builds.
- Pass Chromium, Firefox, WebKit, and a mobile viewport browser suite against the production docs server, including accessibility automation.

Local reports live under `coverage/`, `playwright-report/`, and `artifacts/`.

## Human and account checks before publication

- Review desktop/mobile appearance, keyboard controls, reduced motion, and long notification text.
- Verify announcements with a real screen reader. Automated live-region checks do not prove actual speech behavior.
- Confirm the active npm account and availability of the unscoped notia name.
- Connect the intended GitHub repository and update package repository/homepage/issue links.
- Run hosted CI; add badges only after there is a real passing workflow URL.
- Choose the docs hosting destination and inspect its deployment preview.
- After notia is published, update pending-publication notices and record the actual registry URL. Verify the exact release revision before upload.
- Review dependency audit results and any material limitations.
- Publish the tested artifact and verify a fresh install from npm. Record the release date and public docs URL.

## Future releases

Use Changesets and semantic versioning. Bug fixes receive patch versions; additive features receive minor versions. Treat breaking public API changes explicitly while the package is pre-1.0. Diagnostics cannot ship until their separate production-isolation requirements are tested.
