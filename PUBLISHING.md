# Publish Notia to npm

Target: **notia@0.1.1**. Existing release: **@sravan_saiba/echo@0.1.0**.

These are separate npm packages. The new package can start at 0.1.1, as requested. Publishing it does not rename or remove the original package. No package has been published under the provisional alternative names.

## 1. Check and prepare

The public registry returned 404 for notia on 23 October 2026. This is a point-in-time availability check; npm confirms publishability at upload time.

```powershell
Set-Location 'C:\Users\srava\Downloads\echo'
pnpm install --frozen-lockfile
pnpm exec playwright install chromium firefox webkit
pnpm verify
```

Complete the remaining human checks in RELEASE.md and review the new site with `pnpm dev`. The full gate must pass before publication. Add the real repository and public docs URLs when available; do not use placeholder links.

## 2. Confirm your account

The user's login succeeded as sravan_saiba. Confirm the active account:

```powershell
npm whoami
```

If needed, run `npm login` and complete browser authentication. The new unscoped name does not require a username prefix. Follow npm's authentication and 2FA prompts yourself.

## 3. Inspect the exact package

The workspace folder name is unchanged:

```powershell
Set-Location 'C:\Users\srava\Downloads\echo\packages\echo'
npm pack --dry-run
```

Confirm the output says **notia@0.1.1** and lists only the intended dist files, package.json, README, license, and changelog.

## 4. Publish manually

This command uploads the package; the preceding commands do not:

```powershell
npm publish --access public
```

The prepublishOnly script reruns the complete gate. Do not bypass it with --ignore-scripts. Successful output should end with `+ notia@0.1.1`.

## 5. Confirm and try a clean install

```powershell
npm view notia version
```

Then install into a separate React project:

```powershell
npm install notia
```

Use `{ notia, Toaster }` from `notia` and import `notia/styles.css`. The public package page will be https://www.npmjs.com/package/notia after publication. Deploy the Next.js website separately.

## Migrate an existing app

These commands are only for a separate application that installed the old package. Do not run them in this library workspace (`C:\Users\srava\Downloads\echo`); its docs already use the local Notia package. Use pnpm for dependency installation/removal in this workspace. npm login, pack, and publish remain appropriate for npm publication.

```powershell
npm uninstall @sravan_saiba/echo
npm install notia
```

Change JavaScript import paths to `notia` and the stylesheet import to `notia/styles.css`. New code should use `notia.success()` and the other notia methods. Existing `echo` imports remain valid as an alias. CSS variables and class names retain their echo prefix for compatibility.

Do not unpublish the original scoped package. After notia is live, a deprecation notice on the old package can optionally direct users to the new name. That registry action has not been performed.

## Future versions

After 0.1.1 is published, a compatible patch is normally 0.1.2. Use Changesets from the workspace root to update the version and changelog, then review and publish from packages/echo. A previously published name/version cannot be reused.

## Official references

- https://docs.npmjs.com/creating-and-publishing-unscoped-public-packages/
- https://docs.npmjs.com/cli/v11/commands/npm-publish/
