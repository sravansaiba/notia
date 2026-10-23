import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { execSync, execFileSync, spawn } from 'node:child_process';
import { createServer } from 'node:net';
import { fileURLToPath } from 'node:url';
import { build, preview } from 'vite';
import { chromium } from '@playwright/test';

const root = new URL('..', import.meta.url);
const pkg = JSON.parse(
  await readFile(new URL('packages/echo/package.json', root), 'utf8'),
);
const packed = JSON.parse(
  await readFile(new URL('artifacts/package-report.json', root), 'utf8'),
);
assert.equal(
  packed.name,
  pkg.name,
  'Pack the current package before checking compatibility',
);
assert.equal(
  packed.version,
  pkg.version,
  'Packed version must match the release',
);
const tarball = fileURLToPath(
  new URL(`packages/echo/${packed.tarball}`, root),
).replaceAll('\\', '/');
const browser = await chromium.launch();
async function verifyNext(directory) {
  const app = new URL('next-fixture/', directory);
  await mkdir(new URL('app/', app), { recursive: true });
  await mkdir(new URL('pages/', app), { recursive: true });
  await writeFile(
    new URL('app/layout.tsx', app),
    `import type { ReactNode } from 'react';
import { Toaster } from 'notia';
import 'notia/styles.css';
export default function Layout({ children }: { children: ReactNode }) { return <html lang="en"><body>{children}<Toaster /></body></html>; }
`,
  );
  await writeFile(
    new URL('app/page.tsx', app),
    `'use client';
import { notia as echo } from 'notia';
export default function Page() { return <main><h1>App Router fixture</h1><button onClick={() => echo.success('App Router tarball works')}>Notify</button></main>; }
`,
  );
  await writeFile(
    new URL('pages/_app.tsx', app),
    `import type { AppProps } from 'next/app';
import { Toaster } from 'notia';
import 'notia/styles.css';
export default function App({ Component, pageProps }: AppProps) { return <><Component {...pageProps} /><Toaster /></>; }
`,
  );
  await writeFile(
    new URL('pages/legacy.tsx', app),
    `import { notia as echo } from 'notia';
export default function Page() { return <main><h1>Pages Router fixture</h1><button onClick={() => echo.success('Pages Router tarball works')}>Notify</button></main>; }
`,
  );
  await writeFile(
    new URL('next.config.mjs', app),
    `import { fileURLToPath } from 'node:url';
export default { turbopack: { root: fileURLToPath(new URL('..', import.meta.url)) } };`,
  );
  await writeFile(
    new URL('tsconfig.json', app),
    JSON.stringify({
      compilerOptions: {
        strict: true,
        skipLibCheck: true,
        esModuleInterop: true,
        jsx: 'preserve',
        target: 'ES2022',
        moduleResolution: 'bundler',
        module: 'esnext',
        noEmit: true,
      },
      include: ['**/*.tsx', 'next-env.d.ts', '.next/types/**/*.ts'],
      exclude: ['node_modules'],
    }),
  );
  const next = fileURLToPath(
    new URL('node_modules/next/dist/bin/next', directory),
  );
  const cwd = fileURLToPath(app);
  execFileSync(process.execPath, [next, 'build', cwd], {
    cwd,
    stdio: 'inherit',
    env: { ...process.env, NEXT_TELEMETRY_DISABLED: '1' },
  });
  const socket = createServer();
  await new Promise((resolve) => socket.listen(0, '127.0.0.1', resolve));
  const address = socket.address();
  assert.ok(address && typeof address !== 'string');
  await new Promise((resolve, reject) =>
    socket.close((error) => (error ? reject(error) : resolve())),
  );
  const server = spawn(
    process.execPath,
    [
      next,
      'start',
      cwd,
      '--hostname',
      '127.0.0.1',
      '--port',
      String(address.port),
    ],
    { cwd, stdio: ['ignore', 'pipe', 'pipe'] },
  );
  let output = '';
  server.stdout.on('data', (chunk) => {
    output += chunk;
  });
  server.stderr.on('data', (chunk) => {
    output += chunk;
  });
  try {
    const url = `http://127.0.0.1:${address.port}`;
    let ready = false;
    for (let attempt = 0; attempt < 120; attempt++) {
      try {
        const response = await fetch(url);
        if (response.ok) {
          ready = true;
          break;
        }
      } catch {
        /* Server is starting. */
      }
      if (server.exitCode !== null) break;
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
    assert.ok(ready, `Packed Next.js fixture failed to start: ${output}`);
    for (const [route, message] of [
      ['/', 'App Router tarball works'],
      ['/legacy', 'Pages Router tarball works'],
    ]) {
      const page = await browser.newPage();
      const errors = [];
      page.on('pageerror', (error) => errors.push(error.message));
      await page.goto(url + route);
      await page.getByRole('button', { name: 'Notify' }).click();
      await page.locator('.echo-message', { hasText: message }).waitFor();
      assert.equal(await page.locator('.echo-toast').count(), 1);
      assert.deepEqual(errors, []);
      await page.close();
    }
  } finally {
    server.kill();
  }
  console.log(
    'Packed Next.js App Router and Pages Router production builds and hydration passed.',
  );
}
try {
  for (const [name, react, types] of [
    ['react18', '18.3.1', '^18.3.0'],
    ['react19', '19.3.1', '^19.3.0'],
  ]) {
    const directory = new URL(`artifacts/${name}/`, root);
    await mkdir(directory, { recursive: true });
    const cwd = fileURLToPath(directory);
    await writeFile(
      new URL('package.json', directory),
      JSON.stringify(
        {
          private: true,
          type: 'module',
          dependencies: {
            notia: `file:${tarball}`,
            react,
            'react-dom': react,
            ...(name === 'react19' ? { next: '16.4.2' } : {}),
          },
          devDependencies: { '@types/react': types, '@types/react-dom': types },
        },
        null,
        2,
      ),
    );
    execSync('npm install --ignore-scripts --no-audit --no-fund', {
      cwd,
      stdio: 'inherit',
    });
    const installed = JSON.parse(
      await readFile(
        new URL('node_modules/notia/package.json', directory),
        'utf8',
      ),
    );
    assert.equal(installed.version, pkg.version);
    await writeFile(
      new URL('server.mjs', directory),
      `import assert from 'node:assert/strict';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { Toaster, notia as echo } from 'notia';
assert.equal(renderToString(React.createElement(Toaster)), '');
assert.equal(echo.success('No server state'), '');
assert.equal(await echo.promise(Promise.resolve(7), { loading: 'Wait', success: 'Done', error: 'No' }), 7);
`,
    );
    await writeFile(
      new URL('server.cjs', directory),
      `const assert = require('node:assert/strict');
const React = require('react');
const {renderToString} = require('react-dom/server');
const {Toaster, notia: echo} = require('notia');
assert.equal(renderToString(React.createElement(Toaster)), '');
assert.equal(echo.success('No server state'), '');
`,
    );
    execFileSync(process.execPath, ['server.mjs'], { cwd, stdio: 'inherit' });
    execFileSync(process.execPath, ['server.cjs'], { cwd, stdio: 'inherit' });
    await writeFile(
      new URL('types.mts', directory),
      `import { notia as echo, type ToastOptions } from 'notia';
const options: ToastOptions = { duration: Infinity, id: 'typed' };
const id: string = echo.success('Typed', options);
const promise: Promise<number> = echo.promise(Promise.resolve(1), { loading: 'Wait', success: (value) => String(value), error: (error: unknown) => String(error) });
echo.dismiss(id);
void promise;
// @ts-expect-error invalid option must be rejected
echo.success('Invalid', { duration: 'forever' });
`,
    );
    await writeFile(
      new URL('types.cts', directory),
      `import library = require('notia');
const id: string = library.notia.success('Typed CommonJS');
library.notia.dismiss(id);
`,
    );
    execFileSync(
      process.execPath,
      [
        fileURLToPath(new URL('node_modules/typescript/bin/tsc', root)),
        '--noEmit',
        '--strict',
        '--skipLibCheck',
        '--target',
        'ES2022',
        '--module',
        'NodeNext',
        '--moduleResolution',
        'NodeNext',
        'types.mts',
        'types.cts',
      ],
      { cwd, stdio: 'inherit' },
    );
    await writeFile(
      new URL('index.html', directory),
      '<!doctype html><html lang="en"><head><title>Notia compatibility</title></head><body><div id="root"></div><script type="module" src="/main.tsx"></script></body></html>',
    );
    await writeFile(
      new URL('main.tsx', directory),
      `import React from 'react';
import { createRoot } from 'react-dom/client';
import { notia as echo, Toaster } from 'notia';
import 'notia/styles.css';
createRoot(document.getElementById('root')!).render(<React.StrictMode><button onClick={() => echo.success('Packed package works')}>Notify</button><Toaster /></React.StrictMode>);
`,
    );
    const config = { configFile: false, root: cwd, logLevel: 'error' };
    await build(config);
    const server = await preview({
      ...config,
      preview: { host: '127.0.0.1', port: 0 },
    });
    try {
      const address = server.httpServer.address();
      assert.ok(address && typeof address !== 'string');
      const page = await browser.newPage();
      const errors = [];
      page.on('pageerror', (error) => errors.push(error.message));
      await page.goto(`http://127.0.0.1:${address.port}`);
      await page.getByRole('button', { name: 'Notify' }).click();
      await page
        .locator('.echo-message', { hasText: 'Packed package works' })
        .waitFor();
      assert.equal(await page.locator('.echo-toast').count(), 1);
      assert.equal(
        await page
          .locator('.echo-toast')
          .evaluate((element) => getComputedStyle(element).position),
        'relative',
        'Published CSS is loaded',
      );
      await page.getByRole('button', { name: 'Dismiss notification' }).click();
      await page.locator('.echo-toast').waitFor({ state: 'detached' });
      assert.deepEqual(errors, []);
      await page.close();
    } finally {
      await server.close();
    }
    console.log(
      `${name}: packed ESM, CJS, declarations, SSR, Vite build, CSS, and browser interaction passed.`,
    );
    if (name === 'react19') await verifyNext(directory);
  }
} finally {
  await browser.close();
}
