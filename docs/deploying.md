# Deploy the Notia website to Vercel

This repository is a pnpm workspace. The Next.js application is in `apps/docs`; the repository root is a private workspace package without a Next.js dependency.

## Project settings

In Vercel, open the project's Settings and find Root Directory and Build Settings:

| Setting                                                              | Value                                           |
| -------------------------------------------------------------------- | ----------------------------------------------- |
| Root Directory                                                       | `apps/docs`                                     |
| Include source files outside of the Root Directory in the Build Step | Enabled                                         |
| Framework Preset                                                     | Next.js                                         |
| Install Command                                                      | `pnpm install --frozen-lockfile`                |
| Build Command                                                        | `pnpm --workspace-root run build`               |
| Output Directory                                                     | Default Next.js setting; leave the override off |
| Node.js Version                                                      | 22.x                                            |

`apps/docs/vercel.json` records the framework, install command, and build command. Remove conflicting dashboard command overrides or set them to the values above. Root Directory must be set in the Vercel project settings; the app configuration cannot fix detection when Vercel is looking at the wrong package.json.

The build runs from the workspace root, compiling the local Notia library before Next.js. The docs use `notia: workspace:*`, so Vercel needs access to `packages/echo`, `scripts`, and the root workspace files. Do not change this dependency to the npm package to work around the build setup.

## Upload and redeploy

Commit and push the deployment configuration and this guide. Save the Vercel settings, then deploy the new commit. Do not redeploy an older commit that lacks the configuration.

The log should detect Next.js, build the local `notia` package, and then build `@notia/docs`. Once deployed, check `/`, `/playground`, `/docs`, and direct loading of `/docs/api`.

Deploying this website does not publish or change any npm package. A successful local build does not establish that a hosted Vercel deployment succeeded.

## Local build check

From `apps/docs`, run the same command used by Vercel:

```powershell
pnpm --workspace-root run build
```

## References

- https://vercel.com/docs/monorepos/monorepo-faq
- https://vercel.com/docs/builds/configure-a-build
