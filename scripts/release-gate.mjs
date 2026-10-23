import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

console.log(
  'Running the complete release checks before publishing. Nothing is published by this check.',
);
execSync('pnpm verify', {
  cwd: fileURLToPath(new URL('..', import.meta.url)),
  stdio: 'inherit',
});
