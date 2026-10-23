import { copyFile } from 'node:fs/promises';
await copyFile(
  new URL('../packages/echo/src/styles.css', import.meta.url),
  new URL('../packages/echo/dist/styles.css', import.meta.url),
);
