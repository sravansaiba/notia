import { chromium, devices } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const artifacts = new URL('../artifacts/', import.meta.url);
await mkdir(artifacts, { recursive: true });
const browser = await chromium.launch();
try {
  const context = await browser.newContext({
    viewport: { width: 1280, height: 1000 },
    recordVideo: {
      dir: fileURLToPath(new URL('videos/', artifacts)),
      size: { width: 1280, height: 1000 },
    },
  });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:3000');
  await page.screenshot({
    path: fileURLToPath(new URL('echo-desktop.png', artifacts)),
  });
  await page.getByRole('button', { name: 'Give it a toast' }).click();
  await page.waitForTimeout(1000);
  await page
    .getByRole('navigation', { name: 'Main navigation' })
    .getByRole('link', { name: 'Playground' })
    .click();
  await page.getByLabel('Your message').waitFor();
  await page.getByRole('button', { name: 'Clear notifications' }).click();
  await page.getByRole('button', { name: 'Toast it' }).scrollIntoViewIfNeeded();
  await page.getByRole('button', { name: 'Toast it' }).click();
  await page.waitForTimeout(800);
  await page.getByRole('button', { name: 'Error', exact: true }).click();
  await page.getByRole('button', { name: 'Toast it' }).click();
  await page.waitForTimeout(800);
  await page.getByLabel('Theme', { exact: true }).selectOption('dark');
  await page.getByRole('button', { name: 'Try a promise' }).click();
  await page.waitForTimeout(2200);
  await page.screenshot({
    path: fileURLToPath(new URL('echo-playground.png', artifacts)),
  });
  const video = page.video();
  await context.close();
  await writeFile(
    new URL('demo-video.json', artifacts),
    JSON.stringify({ path: await video.path() }, null, 2),
  );
  const mobile = await browser.newContext({ ...devices['iPhone 13'] });
  const mobilePage = await mobile.newPage();
  await mobilePage.goto('http://127.0.0.1:3000');
  await mobilePage.screenshot({
    path: fileURLToPath(new URL('echo-mobile.png', artifacts)),
  });
  await mobilePage.goto('http://127.0.0.1:3000/playground');
  await mobilePage.getByRole('button', { name: 'Toast it' }).click();
  await mobilePage.screenshot({
    path: fileURLToPath(new URL('echo-mobile-playground.png', artifacts)),
  });
  await mobile.close();
  const docsPage = await browser.newPage({
    viewport: { width: 1280, height: 1000 },
  });
  await docsPage.goto('http://127.0.0.1:3000/docs');
  await docsPage.screenshot({
    path: fileURLToPath(new URL('notia-docs.png', artifacts)),
  });
  await docsPage.close();
  console.log(
    'Desktop/mobile screenshots and demo recording saved in artifacts.',
  );
} finally {
  await browser.close();
}
