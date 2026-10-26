import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFileSync } from 'node:fs';
const guideLinks = Object.keys(
  JSON.parse(
    readFileSync(
      new URL('../../apps/docs/.next/prerender-manifest.json', import.meta.url),
      'utf8',
    ),
  ).routes,
)
  .filter((href) => href === '/docs' || href.startsWith('/docs/'))
  .map((href) => ({ href }));

async function example(page: Page, name: string) {
  await page.goto('/playground');
  await page.bringToFront();
  await page.getByRole('button', { name, exact: true }).click();
  const frame = page;
  await expect(frame.locator('.echo-root')).toBeAttached();
  return frame;
}

test('restores a deleted file and recovers a failed async action without losing focus', async ({
  page,
}) => {
  const frame = await example(page, 'Actions');
  const remove = frame.getByRole('button', { name: 'Delete sample file' });
  await remove.focus();
  await remove.press('Enter');
  await expect(
    frame.getByText('The folder is empty.', { exact: true }),
  ).toBeVisible();
  const undo = frame.getByRole('button', { name: 'Undo', exact: true });
  await undo.focus();
  await undo.press('Enter');
  await expect(
    frame.getByText('File: project-notes.txt', { exact: true }),
  ).toBeVisible();
  await expect(frame.locator('.echo-toast')).toHaveCount(0);
  await expect(
    frame.getByRole('button', { name: 'Delete sample file' }),
  ).toBeFocused();
  await frame.getByRole('button', { name: 'Try a failed action' }).click();
  const save = frame.getByRole('button', { name: 'Save draft', exact: true });
  await save.focus();
  await save.press('Enter');
  await expect(save).toHaveAttribute('aria-busy', 'true');
  await expect(save).toBeFocused();
  await expect(
    frame
      .getByRole('region', { name: 'Example notifications' })
      .getByRole('alert'),
  ).toContainText('Connection lost. Try again.');
  await expect(save).toHaveAttribute('aria-disabled', 'false');
  await save.press('Enter');
  await expect(frame.getByRole('status')).toContainText('Draft saved.');
  await frame.getByRole('button', { name: 'Try a failed action' }).click();
  await frame.getByRole('button', { name: 'Cancel', exact: true }).click();
  await expect(
    frame.locator('.echo-toast').filter({ hasText: 'Save your draft.' }),
  ).toHaveCount(0);
});

test('controls progress lifecycle and restores focus when cancel removes itself', async ({
  page,
}) => {
  const frame = await example(page, 'Progress');
  const complete = frame.getByRole('button', { name: 'Complete upload' });
  const range = frame.getByRole('slider');
  await expect(complete).toBeDisabled();
  await expect(range).toBeDisabled();
  await frame.getByRole('button', { name: 'Start upload' }).click();
  const bar = frame.getByRole('progressbar', { name: 'File upload' });
  await expect(bar).toHaveAttribute('aria-valuenow', '0');
  await range.fill('64');
  await expect(bar).toHaveAttribute('aria-valuenow', '64');
  await expect(frame.locator('.echo-toast')).toHaveCount(1);
  await complete.click();
  await expect(bar).toHaveAttribute('aria-valuenow', '100');
  await expect(frame.locator('.echo-toast')).toHaveAttribute(
    'data-type',
    'success',
  );
  await expect(range).toBeDisabled();
  await page.getByRole('button', { name: 'Reset example' }).click();
  await frame.getByRole('button', { name: 'Start upload' }).click();
  const cancel = frame.getByRole('button', { name: 'Cancel upload' });
  await cancel.focus();
  await cancel.press('Enter');
  await expect(bar).toHaveCount(0);
  await expect(frame.getByRole('status')).toContainText('Upload canceled.');
  await expect(
    frame.getByRole('button', { name: 'Dismiss notification' }),
  ).toBeFocused();
  await expect(complete).toBeDisabled();
});

test('renders custom and text-only icons and expands stacks with keyboard and touch controls', async ({
  page,
}) => {
  let frame = await example(page, 'Icons');
  await frame.getByRole('button', { name: 'Show custom icon' }).click();
  await expect(frame.locator('.echo-icon-wrap')).toHaveText('✦');
  await frame.getByRole('button', { name: 'Show text only' }).click();
  await expect(
    frame
      .locator('.echo-toast')
      .filter({ hasText: 'The message is enough.' })
      .locator('.echo-icon-wrap'),
  ).toHaveCount(0);
  await page.getByRole('button', { name: 'Stacks', exact: true }).click();
  frame = page;
  await frame.getByRole('button', { name: 'Show a stack' }).click();
  await expect(frame.locator('.echo-toast:visible')).toHaveCount(1);
  await frame.getByRole('button', { name: 'Expand notifications' }).click();
  await expect(frame.locator('.echo-toast:visible')).toHaveCount(3);
  await frame
    .getByRole('button', { name: 'Collapse notifications' })
    .press('Enter');
  await expect(frame.locator('.echo-toast:visible')).toHaveCount(1);
  await frame.getByRole('button', { name: 'Dismiss notification' }).focus();
  await expect(frame.locator('.echo-toast:visible')).toHaveCount(3);
});

test('isolates RTL direction and resets notifications when switching examples', async ({
  page,
}) => {
  const frame = await example(page, 'RTL');
  await frame
    .getByRole('button', { name: 'Show Japanese notification' })
    .click();
  const region = frame.getByRole('region', { name: '通知' });
  await expect(region).toHaveAttribute('lang', 'ja');
  await expect(region).toHaveCSS('direction', 'ltr');
  await page.getByLabel('Mirror layout (RTL test)').check();
  await expect(region).toHaveCSS('direction', 'rtl');
  await expect(region).toHaveAttribute('data-position', 'bottom-right');
  await expect(
    frame.getByRole('button', { name: '通知を閉じる' }),
  ).toBeVisible();
  const icon = await region.locator('.echo-icon-wrap').boundingBox();
  const message = await region.locator('.echo-message').boundingBox();
  expect(icon!.x).toBeGreaterThan(message!.x);
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await page.getByRole('button', { name: 'Progress', exact: true }).click();
  await expect(page.locator('.echo-toast')).toHaveCount(0);
  await page.getByRole('button', { name: 'RTL', exact: true }).click();
  await expect(page.locator('.echo-toast')).toHaveCount(0);
});

test('defaults to light, remembers the theme toggle, and keeps code selection copyable', async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: async (text: string) => {
          document.documentElement.dataset.copied = text;
        },
      },
    });
  });
  await page.goto('/docs/actions');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.getByRole('button', { name: 'Dark mode', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.getByLabel('Code language').selectOption('js');
  await expect(page.locator('.code-header')).toContainText('App.jsx');
  await expect(page.locator('pre')).not.toContainText('useState<boolean>');
  await page.getByRole('button', { name: 'Copy code', exact: true }).click();
  const copied = await page.locator('html').getAttribute('data-copied');
  expect(copied).toBe(await page.locator('pre code').textContent());
  await page.goto('/docs/progress');
  await expect(page.getByLabel('Code language')).toHaveValue('js');
  await expect(page.locator('pre')).not.toContainText('useRef<string');
  await page.getByLabel('Code language').selectOption('ts');
  await expect(page.locator('pre')).toContainText('useRef<string');
  await page.emulateMedia({ colorScheme: 'light' });
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.getByRole('button', { name: 'Dark mode', exact: true }).click();
  await page.emulateMedia({ colorScheme: 'dark' });
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await expect(
    page.getByRole('button', { name: 'Dark mode', exact: true }),
  ).toHaveAttribute('aria-pressed', 'false');
});

test('searches guides, opens mobile navigation, and provides direct pages for every topic', async ({
  page,
  isMobile,
  browserName,
}) => {
  test.skip(
    browserName !== 'chromium',
    'Route content is shared; interactions run in every browser.',
  );
  await page.goto('/docs');
  if (isMobile)
    await page.getByRole('button', { name: 'Browse documentation' }).click();
  await page.getByRole('searchbox', { name: 'Find a guide' }).fill('undo');
  await expect(
    page
      .getByRole('navigation', { name: 'Documentation sections' })
      .getByRole('link'),
  ).toHaveCount(1);
  await page.getByRole('link', { name: 'Buttons & Undo', exact: true }).click();
  await expect(page).toHaveURL(/\/docs\/actions$/);
  if (isMobile)
    await expect(
      page.getByRole('button', { name: 'Browse documentation' }),
    ).toHaveAttribute('aria-expanded', 'false');
  for (const { href } of guideLinks) {
    await page.goto(href);
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
    const width = await page.evaluate(() => ({
      content: document.documentElement.scrollWidth,
      viewport: innerWidth,
    }));
    expect(width.content, href).toBeLessThanOrEqual(width.viewport);
  }
  if (isMobile) {
    await page.goto('/docs/api');
    const table = page.getByRole('region', {
      name: 'Container settings table',
    });
    await table.focus();
    await table.press('ArrowRight');
    await expect
      .poll(() => table.evaluate((element) => element.scrollLeft))
      .toBeGreaterThan(0);
  }
});

test('keeps docs, themes, interactive examples, and motion preferences accessible', async ({
  page,
  browserName,
}) => {
  test.skip(
    browserName !== 'chromium',
    'Shared page markup is scanned in desktop and mobile Chromium.',
  );
  test.setTimeout(120000);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const theme of ['light', 'dark']) {
    for (const route of [
      '/',
      ...guideLinks.map((link) => link.href),
      '/playground',
    ]) {
      await page.goto(route);
      if ((await page.locator('html').getAttribute('data-theme')) !== theme)
        await page
          .getByRole('button', { name: 'Dark mode', exact: true })
          .click();
      const frame = page;
      if (route === '/docs/actions')
        await frame.getByRole('button', { name: 'Delete sample file' }).click();
      if (route === '/docs/progress')
        await frame.getByRole('button', { name: 'Start upload' }).click();
      if (route === '/docs/stacks')
        await frame.getByRole('button', { name: 'Show a stack' }).click();
      if (route === '/docs/rtl')
        await frame
          .getByRole('button', { name: 'Show Japanese notification' })
          .click();
      const result = await new AxeBuilder({ page }).analyze();
      expect(
        result.violations.map((v) => ({
          id: v.id,
          targets: v.nodes.map((n) => n.target),
        })),
        `${route} ${theme}`,
      ).toEqual([]);
    }
  }
});

test('returns a useful not-found response for unknown guide and example names', async ({
  page,
}) => {
  for (const route of ['/docs/not-a-guide', '/examples/toString']) {
    const response = await page.goto(route);
    expect(response?.status()).toBe(404);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('404');
  }
});

test('shows guide results on the website without a preview box or keyboard focus change', async ({
  page,
}) => {
  await page.goto('/docs/actions');
  await expect(page.locator('iframe')).toHaveCount(0);
  const code = await page.locator('.live-example .code-block').boundingBox();
  const controls = await page.locator('.inline-demo').boundingBox();
  expect(code).not.toBeNull();
  expect(controls).not.toBeNull();
  expect(code!.y + code!.height).toBeLessThanOrEqual(controls!.y);
  const frame = page;
  const remove = frame.getByRole('button', { name: 'Delete sample file' });
  await remove.focus();
  await remove.press('Enter');
  const card = frame.locator('.echo-toast');
  await expect(card).toBeVisible();
  await expect
    .poll(() =>
      card.evaluate((element) => getComputedStyle(element, '::after').content),
    )
    .toBe('none');
  await expect
    .poll(async () => {
      const bounds = await card.boundingBox();
      return Boolean(
        bounds &&
        bounds.y >= 0 &&
        bounds.y + bounds.height <= page.viewportSize()!.height,
      );
    })
    .toBe(true);
  await expect(remove).toBeFocused();
});
