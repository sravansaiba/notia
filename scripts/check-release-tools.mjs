import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';

const rootRequire = createRequire(import.meta.url);
const cliRequire = createRequire(
  rootRequire.resolve('@changesets/cli/package.json'),
);
const { readConfig } = await import(
  pathToFileURL(cliRequire.resolve('@changesets/config')).href
);
const result = await readConfig(fileURLToPath(new URL('..', import.meta.url)));
assert.equal(result.errors, undefined);
assert.ok(result.config);
const config = result.config;
assert.equal(config.access, 'public');
assert.equal(config.changelog[0], '@changesets/cli/changelog');
const changelog = await import('@changesets/cli/changelog');
assert.equal(typeof changelog.default.getReleaseLine, 'function');
assert.equal(typeof changelog.default.getDependencyReleaseLine, 'function');
console.log(
  'Release configuration and changelog adapter verified without modifying versions.',
);
