import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.beforeEach(async ({ page }, testInfo) => {
  // Hydration tests attach their error listeners before their first navigation.
  if (
    testInfo.title.startsWith('renders without hydration errors') ||
    testInfo.title === 'works in the Next.js Pages Router'
  )
    return;
  await page.goto('/playground');
  await page.bringToFront();
  await expect(
    page.getByRole('region', { name: 'Notifications' }),
  ).toBeAttached();
});

test('renders without hydration errors and shows a working toast', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await page.bringToFront();
  await expect(
    page.getByRole('region', { name: 'Notifications' }),
  ).toBeAttached();
  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    'A little feedback.',
  );
  await page.getByRole('button', { name: 'Give it a toast' }).click();
  await expect(page.locator('.echo-toast')).toHaveCount(1);
  await expect(page.getByRole('status')).toContainText('Your work, saved.');
  expect(errors).toEqual([]);
});

test('caps the visible stack and clears the queue', async ({ page }) => {
  const trigger = page.getByRole('button', { name: 'Toast it' });
  for (let i = 0; i < 6; i++) await trigger.click();
  await expect(page.locator('.echo-toast')).toHaveCount(3);
  await page.getByRole('button', { name: 'Clear notifications' }).click();
  await expect(page.locator('.echo-toast')).toHaveCount(0);
});

test('wraps long custom messages and deduplicates repeated loading notifications', async ({
  page,
}) => {
  const message = 'A long notification with an-unbroken-identifier-'.repeat(10);
  await page.getByLabel('Your message').fill(message);
  await expect(page.getByLabel('Your message')).toHaveValue(message);
  await page.getByRole('button', { name: 'Loading', exact: true }).click();
  await expect(page.getByLabel('Your message')).toHaveValue(message);
  await page.getByRole('button', { name: 'Toast it' }).click();
  await page.getByRole('button', { name: 'Toast it' }).click();
  await expect(page.locator('.echo-toast')).toHaveCount(1);
  await expect(page.locator('.echo-message')).toHaveText(message);
  const dimensions = await page
    .locator('.echo-message')
    .evaluate((element) => ({
      content: element.scrollWidth,
      box: element.clientWidth,
    }));
  expect(dimensions.content).toBeLessThanOrEqual(dimensions.box);
});

test('waits for hydration before accepting custom message input', async ({
  page,
}) => {
  let releaseScripts!: () => void;
  const scriptsReady = new Promise<void>((resolve) => {
    releaseScripts = resolve;
  });
  await page.route('**/_next/static/**/*.js', async (route) => {
    await scriptsReady;
    await route.continue();
  });
  try {
    await page.goto('/playground', { waitUntil: 'commit' });
    await expect(page.getByLabel('Your message')).toBeDisabled();
  } finally {
    releaseScripts();
  }
  await expect(page.getByLabel('Your message')).toBeEnabled();
  await page.getByLabel('Your message').fill('Typed after hydration');
  await page.getByRole('button', { name: 'Loading', exact: true }).click();
  await page.getByRole('button', { name: 'Toast it' }).click();
  await expect(page.locator('.echo-message')).toHaveText(
    'Typed after hydration',
  );
});

test('completes and rejects promise toasts without unhandled errors', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.getByRole('button', { name: 'Try a promise' }).click();
  await expect(page.locator('.echo-toast')).toHaveAttribute(
    'data-type',
    'loading',
  );
  await expect(page.locator('.echo-toast')).toHaveAttribute(
    'data-type',
    'success',
  );
  await page.getByRole('button', { name: 'Clear notifications' }).click();
  await page.getByRole('checkbox', { name: 'Simulate an error' }).check();
  await page.getByRole('button', { name: 'Try a promise' }).click();
  await expect(page.locator('.echo-toast')).toHaveAttribute(
    'data-type',
    'error',
  );
  await expect(
    page.getByRole('region', { name: 'Notifications' }).getByRole('alert'),
  ).toContainText('Could not save');
  expect(errors).toEqual([]);
});

test('updates theme and all six positions', async ({ page }) => {
  await page.getByRole('button', { name: 'Toast it' }).click();
  for (const position of [
    'top-left',
    'top-center',
    'top-right',
    'bottom-left',
    'bottom-center',
    'bottom-right',
  ]) {
    await page.getByLabel('Position', { exact: true }).selectOption(position);
    await expect(page.locator('.echo-root')).toHaveAttribute(
      'data-position',
      position,
    );
  }
  await page.getByLabel('Theme', { exact: true }).selectOption('dark');
  await expect(page.locator('.echo-toast')).toHaveCSS(
    'background-color',
    'rgb(34, 35, 43)',
  );
});

test('supports focused Escape and returns focus to the trigger', async ({
  page,
}) => {
  const trigger = page.getByRole('button', { name: 'Toast it' });
  await trigger.focus();
  await trigger.press('Enter');
  await expect(trigger).toBeFocused();
  await page.getByRole('button', { name: 'Dismiss notification' }).focus();
  await page.keyboard.press('Escape');
  await expect(page.locator('.echo-toast')).toHaveCount(0);
  await expect(trigger).toBeFocused();
});

test('pauses the remaining duration on hover', async ({ page, isMobile }) => {
  test.skip(isMobile, 'Touch devices do not have hover.');
  await page.getByLabel('Duration').fill('2000');
  await page.getByRole('button', { name: 'Toast it' }).click();
  await page.locator('.echo-toast').hover();
  await page.waitForTimeout(2300);
  await expect(page.locator('.echo-toast')).toHaveAttribute(
    'data-state',
    'visible',
  );
  await page.mouse.move(0, 0);
  await expect(page.locator('.echo-toast')).toHaveCount(0, { timeout: 5000 });
});

test('dismisses a toast with a horizontal swipe', async ({ page }) => {
  await page.getByRole('button', { name: 'Toast it' }).click();
  const message = page.locator('.echo-message');
  const box = await message.boundingBox();
  expect(box).not.toBeNull();
  if (!box) return;
  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x + 90, y + 5, { steps: 8 });
  await page.mouse.up();
  await expect(page.locator('.echo-toast')).toHaveCount(0);
});

test('honors reduced motion and has no horizontal page overflow', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.getByRole('button', { name: 'Toast it' }).click();
  await expect(page.locator('.echo-toast')).toHaveCSS('animation-name', 'none');
  const width = await page.evaluate(() => ({
    content: document.documentElement.scrollWidth,
    viewport: window.innerWidth,
  }));
  expect(width.content).toBeLessThanOrEqual(width.viewport);
});

test('passes automated accessibility checks in light and dark toast themes', async ({
  page,
}) => {
  // A persistent toast prevents contrast scans from sampling its fade-out.
  await page.getByRole('button', { name: 'Loading', exact: true }).click();
  await page.getByRole('button', { name: 'Toast it' }).click();
  await expect(page.locator('.echo-toast')).toHaveCSS('opacity', '1');
  const light = await new AxeBuilder({ page }).analyze();
  expect(
    light.violations.map((violation) => ({
      id: violation.id,
      nodes: violation.nodes.map((node) => ({
        target: node.target,
        message: node.failureSummary,
      })),
    })),
  ).toEqual([]);
  await page.getByLabel('Theme', { exact: true }).selectOption('dark');
  const dark = await new AxeBuilder({ page }).analyze();
  expect(
    dark.violations.map((violation) => ({
      id: violation.id,
      nodes: violation.nodes.map((node) => ({
        target: node.target,
        message: node.failureSummary,
      })),
    })),
  ).toEqual([]);
});

test('works in the Next.js Pages Router', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/compatibility');
  await page.bringToFront();
  await expect(
    page.getByRole('region', { name: 'Notifications' }),
  ).toBeAttached();
  await page.getByRole('button', { name: 'Show toast' }).click();
  await expect(page.locator('.echo-message')).toHaveText('Pages Router works');
  expect(errors).toEqual([]);
});

test('provides keyboard-navigable examples and usable documentation links', async ({
  page,
}) => {
  await page.getByRole('tab', { name: 'The basics' }).focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('tab', { name: 'Promises' })).toBeFocused();
  await expect(page.getByRole('tabpanel')).toContainText('notia.promise');
  await page
    .getByRole('navigation', { name: 'Main navigation' })
    .getByRole('link', { name: 'Docs', exact: true })
    .click();
  await expect(page).toHaveURL(/\/docs$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'A little guidance. Then you’re building.',
  );
});

test('keeps home, playground, and documentation on separate routes', async ({
  page,
  isMobile,
}) => {
  await page.goto('/');
  await expect(page.getByLabel('Your message')).toHaveCount(0);
  await page
    .getByRole('navigation', { name: 'Main navigation' })
    .getByRole('link', { name: 'Playground', exact: true })
    .click();
  await expect(page).toHaveURL(/\/playground$/);
  await expect(page.getByLabel('Your message')).toBeEnabled();
  await expect(
    page
      .getByRole('navigation', { name: 'Main navigation' })
      .getByRole('link', { name: 'Playground', exact: true }),
  ).toHaveAttribute('aria-current', 'page');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'A small message. A useful next step.',
  );
  await page
    .getByRole('navigation', { name: 'Main navigation' })
    .getByRole('link', { name: 'Docs', exact: true })
    .click();
  await expect(page.getByLabel('Your message')).toHaveCount(0);
  if (isMobile)
    await page.getByRole('button', { name: 'Browse documentation' }).click();
  await page
    .getByRole('navigation', { name: 'Documentation sections' })
    .getByRole('link', { name: 'All settings', exact: true })
    .click();
  await expect(page).toHaveURL(/\/docs\/api$/);
  await page.reload();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'All settings',
  );
  await expect(
    page.getByRole('table', { name: 'Notia API methods' }),
  ).toContainText('notia.success');
});

test('checks accessibility and layout on every documentation route', async ({
  page,
  browserName,
}) => {
  test.skip(
    browserName !== 'chromium',
    'Shared route markup is checked in desktop and mobile Chromium; all toast interactions run in every engine.',
  );
  for (const route of [
    '/',
    '/docs',
    '/docs/api',
    '/docs/styling',
    '/docs/accessibility',
    '/docs/releases',
  ]) {
    await page.goto(route);
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
    const result = await new AxeBuilder({ page }).analyze();
    expect(
      result.violations.map((violation) => ({
        id: violation.id,
        targets: violation.nodes.map((node) => node.target),
      })),
      route,
    ).toEqual([]);
    const dimensions = await page.evaluate(() => ({
      content: document.documentElement.scrollWidth,
      viewport: window.innerWidth,
    }));
    expect(dimensions.content, route).toBeLessThanOrEqual(dimensions.viewport);
  }
});
