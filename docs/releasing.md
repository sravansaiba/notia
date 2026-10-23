# Releasing Notia

Notia is published as [`notia`](https://www.npmjs.com/package/notia). The release version is defined in `packages/echo/package.json`; the workspace root is private. Use pnpm for workspace dependencies and npm for account authentication and publication.

## 1. Prepare the change

Complete the implementation, relevant tests, package README, and website examples. For a library change, run this command from the repository root:

```sh
pnpm changeset
```

Select `notia`, choose the bump type, and describe the change for users. Compatible fixes use a patch; additive features use a minor. For example, `0.1.1` becomes `0.1.2` for a patch or `0.2.0` for a minor. Review breaking changes explicitly while the package is pre-1.0 and document migration steps.

Changesets accumulate until a release is prepared. Multiple changes can ship together; there is no requirement to publish after each commit. Website-only changes can be deployed without publishing an npm version.

## 2. Apply the version

From the repository root:

```sh
pnpm version-packages
pnpm install --lockfile-only
```

Review the generated package version and changelog, and any lockfile changes. Changesets owns the version update; do not also run `npm version` for the same release.

Update hardcoded website version labels and release notes to match. The README displayed on npm comes from `packages/echo/README.md`.

## 3. Verify the release

```sh
pnpm exec playwright install chromium firefox webkit
pnpm run verify
```

The full gate audits dependencies, builds the package and website, checks coverage/types/lint/formatting, validates release tooling and package contents, exercises isolated packed consumers, and runs browser/accessibility checks. See [CONTRIBUTING.md](../CONTRIBUTING.md) for individual commands and report locations.

Review the desktop/mobile presentation, keyboard behavior, reduced motion, and actual screen reader announcements. Review dependency audit results and package contents. Confirm repository and documentation links point to real destinations.

Commit the reviewed source, documentation, and version changes. Release the same revision that passed verification; rerun the gate if it changes.

## 4. Inspect and publish

From the repository root, enter the library directory:

```sh
cd packages/echo
npm whoami
npm pack --dry-run
```

Confirm the intended account, package name, new version, and file list. The package should include the intended `dist` files, package.json, README, changelog, and license. If authentication is needed, run `npm login` and complete npm's prompts.

Publish manually:

```sh
npm publish --access public
```

The package's `prepublishOnly` script reruns the full gate before upload. Do not bypass it with `--ignore-scripts`. Complete any browser authentication or 2FA prompts. Successful publication reports the package and new version.

Published name/version pairs cannot be overwritten or reused. If a released version has a bug, prepare another version.

## 5. Confirm and record

```sh
npm view notia version
```

Check that the reported version matches the release. Test installation in a separate React application, not inside this workspace:

```sh
npm install notia@latest
```

Verify the import and stylesheet, then exercise the changed behavior. Record the release in Git with an annotated tag matching the published version and push the release commit and tag. For example, from the repository root after successfully publishing version 0.2.0:

```sh
git tag -a v0.2.0 -m "Notia 0.2.0"
git push origin main
git push origin v0.2.0
```

Use the actual version being released. Deploy the updated website separately using [deploying.md](deploying.md).

## GitHub publishing workflow

The repository also includes a manually dispatched [release workflow](../.github/workflows/release.yml). It uses the `npm` environment and `NPM_TOKEN` secret, runs the same verification gate, and requests npm provenance. Configure the environment, credentials, and any approval requirements before using it. Choose either manual CLI publishing or the workflow for a version; do not publish the same version through both.

## References

- [Changesets CLI](https://changesets.dev/guide/cli)
- [npm version updates](https://docs.npmjs.com/updating-your-published-package-version-number/)
- [npm publish](https://docs.npmjs.com/cli/v11/commands/npm-publish/)
