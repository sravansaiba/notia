// @vitest-environment node
import { expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import { echo, Toaster } from '../../packages/echo/src/index';
import { store } from '../../packages/echo/src/core/store';

it('imports and renders without browser globals or shared server mutations', async () => {
  expect(renderToString(<Toaster />)).toBe('');
  expect(echo.success('Server message')).toBe('');
  expect(echo.progress('Server upload', { progress: 40 })).toBe('');
  expect(
    renderToString(
      <Toaster expandable dir="rtl" labels={{ dismiss: 'Close' }} />,
    ),
  ).toBe('');
  expect(echo.error('Error', { id: 'explicit' })).toBe('explicit');
  echo.update('explicit', { message: 'No' });
  echo.dismiss('explicit');
  echo.dismissAll();
  expect(
    await echo.promise(Promise.resolve(42), {
      loading: 'Wait',
      success: 'Done',
      error: 'Failed',
    }),
  ).toBe(42);
  expect(store.getSnapshot()).toEqual([]);
});
