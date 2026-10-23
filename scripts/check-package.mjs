import assert from 'node:assert/strict';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';

const packageDir = fileURLToPath(new URL('../packages/echo/', import.meta.url));
const pkg = JSON.parse(
  await readFile(
    new URL('../packages/echo/package.json', import.meta.url),
    'utf8',
  ),
);
assert.equal(pkg.name, 'notia');
assert.equal(
  Object.keys(pkg.dependencies ?? {}).length,
  0,
  'No bundled runtime dependencies',
);
const files = [
  'index.js',
  'index.cjs',
  'index.d.ts',
  'index.d.cts',
  'styles.css',
];
for (const file of files)
  assert.ok(
    (await readFile(new URL(`../packages/echo/dist/${file}`, import.meta.url)))
      .length > 0,
  );
for (const file of ['index.js', 'index.cjs']) {
  const code = await readFile(
    new URL(`../packages/echo/dist/${file}`, import.meta.url),
    'utf8',
  );
  assert.match(code, /^['"]use client['"]/);
  assert.doesNotMatch(
    code,
    /console\.error\s*=|window\.fetch\s*=|EchoDev|forceEnable/,
    'Core contains no diagnostics',
  );
}
const jsGzip = gzipSync(
  await readFile(new URL('../packages/echo/dist/index.js', import.meta.url)),
).length;
const cssGzip = gzipSync(
  await readFile(new URL('../packages/echo/dist/styles.css', import.meta.url)),
).length;
assert.ok(jsGzip <= 4096, `JS budget exceeded: ${jsGzip} bytes gzip`);
const result = JSON.parse(
  execSync('npm pack --json --ignore-scripts', {
    cwd: packageDir,
    encoding: 'utf8',
  }),
)[0];
const paths = result.files.map((file) => file.path);
for (const required of [
  'README.md',
  'LICENSE',
  'CHANGELOG.md',
  ...files.map((file) => `dist/${file}`),
])
  assert.ok(
    paths.includes(required),
    `Missing ${required} from packed artifact`,
  );
for (const path of paths)
  assert.match(
    path,
    /^(dist\/|README\.md$|LICENSE$|CHANGELOG\.md$|package\.json$)/,
    `Unexpected published file: ${path}`,
  );
await mkdir(new URL('../artifacts/', import.meta.url), { recursive: true });
await writeFile(
  new URL('../artifacts/package-report.json', import.meta.url),
  JSON.stringify(
    {
      name: pkg.name,
      version: pkg.version,
      jsGzipBytes: jsGzip,
      cssGzipBytes: cssGzip,
      files: paths,
      tarball: result.filename,
    },
    null,
    2,
  ),
);
console.log(
  `Package verified. JS: ${jsGzip} bytes gzip; CSS: ${cssGzip} bytes gzip. Tarball: ${result.filename}`,
);
