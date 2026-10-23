import { defineConfig, devices, firefox } from '@playwright/test';
import { cpSync, existsSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

function firefoxExecutable() {
  if (process.env.ECHO_FIREFOX_EXECUTABLE)
    return process.env.ECHO_FIREFOX_EXECUTABLE;
  if (process.platform !== 'win32') return undefined;
  const source = firefox.executablePath();
  if (!existsSync(source)) return undefined;
  // Restricted Windows sessions may not resolve SxS assemblies in the shared cache.
  // Use the same official runtime, unchanged, in the writable test workspace.
  const directory = fileURLToPath(
    new URL(
      `./artifacts/${basename(dirname(dirname(source)))}/`,
      import.meta.url,
    ),
  );
  const executable = join(directory, basename(source));
  if (!existsSync(executable))
    cpSync(dirname(source), directory, { recursive: true });
  return executable;
}
const firefoxPath = firefoxExecutable();

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  // Window-focus pause tests need a single foreground browser at a time.
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://127.0.0.1:3100',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        ...(firefoxPath
          ? { launchOptions: { executablePath: firefoxPath } }
          : {}),
      },
    },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    {
      name: 'mobile',
      use: { ...devices['iPhone 13'], defaultBrowserType: 'chromium' },
    },
  ],
  webServer: {
    command: 'pnpm --filter @notia/docs start --port 3100',
    url: 'http://127.0.0.1:3100',
    reuseExistingServer: false,
    timeout: 60000,
  },
});
