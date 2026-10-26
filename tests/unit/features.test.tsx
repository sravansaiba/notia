import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { notia, Toaster } from '../../packages/echo/src/index';
import { store } from '../../packages/echo/src/core/store';

beforeEach(() => vi.useFakeTimers());
afterEach(() => {
  cleanup();
  store.dismissAll();
  vi.useRealTimers();
});
const tick = (ms: number) => act(() => vi.advanceTimersByTime(ms));
const cards = () => [...document.querySelectorAll<HTMLElement>('.echo-toast')];

describe('notification actions', () => {
  it('prevents double execution, pauses while pending, and restores focus after success', async () => {
    render(
      <>
        <button>Delete file</button>
        <Toaster duration={100} />
      </>,
    );
    const trigger = screen.getByText('Delete file');
    trigger.focus();
    let resolve!: () => void;
    const onClick = vi.fn(
      () =>
        new Promise<void>((done) => {
          resolve = done;
        }),
    );
    let id = '';
    act(() => {
      id = notia.success('Deleted', { action: { label: 'Undo', onClick } });
    });
    const action = screen.getByRole('button', { name: 'Undo' });
    action.focus();
    fireEvent.click(action);
    fireEvent.click(action);
    expect(onClick).toHaveBeenCalledExactlyOnceWith(id);
    expect(action.getAttribute('aria-busy')).toBe('true');
    expect(action.getAttribute('aria-disabled')).toBe('true');
    tick(10000);
    expect(cards()[0]?.dataset.state).toBe('visible');
    await act(async () => {
      resolve();
      await Promise.resolve();
    });
    expect(cards()[0]?.dataset.state).toBe('leaving');
    // Native disabled blurs the focused action before the exit completes in browsers.
    expect(action.hasAttribute('disabled')).toBe(false);
    expect(action.getAttribute('aria-disabled')).toBe('true');
    expect(document.activeElement).toBe(action);
    tick(180);
    expect(cards()).toHaveLength(0);
    expect(document.activeElement).toBe(trigger);
  });
  it('can keep a successful action open and provides a secondary cancel action', async () => {
    const onClick = vi.fn();
    render(<Toaster />);
    act(() => {
      notia.info('Retry?', {
        action: { label: 'Retry', onClick, dismiss: false },
        cancel: { label: 'No thanks', onClick: (id) => notia.dismiss(id) },
      });
    });
    await act(async () =>
      fireEvent.click(screen.getByRole('button', { name: 'Retry' })),
    );
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(cards()[0]?.dataset.state).toBe('visible');
    await act(async () =>
      fireEvent.click(screen.getByRole('button', { name: 'No thanks' })),
    );
    tick(180);
    expect(cards()).toHaveLength(0);
  });
  it('keeps failed actions available to retry and announces the error', async () => {
    const onClick = vi
      .fn()
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce(undefined);
    render(<Toaster />);
    act(() => {
      notia.info('Save draft', {
        action: {
          label: 'Save',
          onClick,
          errorMessage: 'You are offline. Retry.',
        },
      });
    });
    await act(async () =>
      fireEvent.click(screen.getByRole('button', { name: 'Save' })),
    );
    expect(screen.getByRole('alert').textContent).toBe(
      'You are offline. Retry.',
    );
    expect(
      (screen.getByRole('button', { name: 'Save' }) as HTMLButtonElement)
        .disabled,
    ).toBe(false);
    await act(async () =>
      fireEvent.click(screen.getByRole('button', { name: 'Save' })),
    );
    tick(180);
    expect(cards()).toHaveLength(0);
  });
  it('moves keyboard focus to the close control when an action removes itself', async () => {
    render(<Toaster />);
    act(() => {
      notia.info('Upload', {
        cancel: {
          label: 'Cancel upload',
          dismiss: false,
          onClick: (id) => notia.update(id, { cancel: null }),
        },
      });
    });
    const button = screen.getByRole('button', { name: 'Cancel upload' });
    button.focus();
    await act(async () => fireEvent.click(button));
    expect(document.activeElement).toBe(
      screen.getByRole('button', { name: 'Dismiss notification' }),
    );
  });
  it('handles synchronous failures with a translated fallback', async () => {
    render(<Toaster labels={{ actionError: 'Please try again' }} />);
    act(() => {
      notia.info('Work', {
        action: {
          label: 'Run',
          onClick: () => {
            throw new Error('No');
          },
        },
      });
    });
    await act(async () =>
      fireEvent.click(screen.getByRole('button', { name: 'Run' })),
    );
    expect(screen.getByRole('alert').textContent).toBe('Please try again');
  });
  it('does not dismiss or overwrite a replacement with the same ID after an async action settles', async () => {
    render(<Toaster />);
    let reject!: (error: Error) => void;
    act(() => {
      notia.info('Old notification', {
        id: 'same',
        action: {
          label: 'Run',
          onClick: () =>
            new Promise<void>((_, fail) => {
              reject = fail;
            }),
        },
      });
    });
    fireEvent.click(screen.getByRole('button', { name: 'Run' }));
    act(() => {
      notia.dismissAll();
      notia.success('New notification', { id: 'same' });
    });
    await act(async () => {
      reject(new Error('Too late'));
      await Promise.resolve();
    });
    expect(cards()).toHaveLength(1);
    expect(cards()[0]?.dataset.state).toBe('visible');
    expect(cards()[0]?.querySelector('.echo-message')?.textContent).toBe(
      'New notification',
    );
  });
});

describe('progress and icons', () => {
  it('updates progress in place, clamps values, and stays persistent until explicitly completed', () => {
    render(<Toaster duration={500} />);
    let id = '';
    act(() => {
      id = notia.progress('Uploading', {
        progress: -10,
        progressLabel: 'File upload',
      });
    });
    expect(
      screen
        .getByRole('progressbar', { name: 'File upload' })
        .getAttribute('aria-valuenow'),
    ).toBe('0');
    tick(10000);
    act(() => notia.update(id, { progress: 55.5 }));
    expect(screen.getByRole('progressbar').getAttribute('aria-valuenow')).toBe(
      '55.5',
    );
    act(() => notia.update(id, { progress: NaN }));
    expect(screen.getByRole('progressbar').getAttribute('aria-valuenow')).toBe(
      '0',
    );
    act(() => notia.update(id, { progress: 150 }));
    expect(screen.getByRole('progressbar').getAttribute('aria-valuenow')).toBe(
      '100',
    );
    tick(10000);
    expect(cards()[0]?.dataset.state).toBe('visible');
    act(() =>
      notia.update(id, {
        type: 'success',
        message: 'Uploaded',
        progress: undefined,
      }),
    );
    expect(screen.queryByRole('progressbar')).toBeNull();
    expect(screen.getByRole('status').textContent).toBe('Uploaded');
    tick(500);
    expect(cards()[0]?.dataset.state).toBe('leaving');
  });
  it('starts at zero and does not announce each percentage as a new message', () => {
    render(<Toaster />);
    let id = '';
    act(() => {
      id = notia.progress('Uploading');
    });
    expect(screen.getByRole('progressbar').getAttribute('aria-valuenow')).toBe(
      '0',
    );
    act(() => notia.update(id, { progress: 80 }));
    expect(screen.getByRole('status').textContent).toBe('Uploading');
  });
  it('supports global and per-toast icons, hiding them, and switching back to defaults', () => {
    render(
      <Toaster maxVisible={5} icons={{ success: <span>Brand icon</span> }} />,
    );
    let id = '';
    act(() => {
      id = notia.success('Global');
      notia.success('Custom', { icon: <span>Override</span> });
      notia.info('Hidden', { icon: null });
      notia.warning('Also hidden', { icon: false });
    });
    expect(cards()[0]?.querySelector('.echo-icon-wrap')?.textContent).toBe(
      'Brand icon',
    );
    expect(cards()[1]?.querySelector('.echo-icon-wrap')?.textContent).toBe(
      'Override',
    );
    expect(cards()[2]?.querySelector('.echo-icon-wrap')).toBeNull();
    expect(cards()[3]?.querySelector('.echo-icon-wrap')).toBeNull();
    expect(screen.getByRole('status').textContent).not.toContain('Brand icon');
    act(() => notia.update(id, { type: 'error', icon: undefined }));
    expect(cards()[0]?.querySelector('.echo-icon--error')).not.toBeNull();
  });
});

describe('expandable stacks and localization', () => {
  it('hides older controls and pauses hidden timers until they can be read', () => {
    render(<Toaster expandable duration={1000} />);
    act(() => {
      notia.info('First');
      notia.info('Second', {
        action: { label: 'Read second', onClick: () => {} },
      });
      notia.info('Third');
    });
    expect(cards().map((card) => card.hidden)).toEqual([false, true, true]);
    expect(screen.queryByRole('button', { name: 'Read second' })).toBeNull();
    tick(1180);
    expect(
      cards().map((card) => card.querySelector('.echo-message')?.textContent),
    ).toEqual(['Second', 'Third']);
    expect(cards().map((card) => card.hidden)).toEqual([false, true]);
    tick(999);
    expect(cards()[0]?.dataset.state).toBe('visible');
  });
  it('expands on hover, keyboard focus, and explicit toggling without expiring while reading', () => {
    render(<Toaster expandable duration={1000} />);
    act(() => {
      notia.info('One');
      notia.info('Two');
    });
    const region = screen.getByRole('region', { name: 'Notifications' });
    fireEvent.mouseEnter(document.querySelector('.echo-list')!);
    expect(cards().every((card) => !card.hidden)).toBe(true);
    tick(10000);
    expect(cards().every((card) => card.dataset.state === 'visible')).toBe(
      true,
    );
    fireEvent.mouseLeave(region);
    expect(cards()[1]?.hidden).toBe(true);
    fireEvent.focus(
      screen.getByRole('button', { name: 'Dismiss notification' }),
    );
    expect(cards()[1]?.hidden).toBe(false);
    fireEvent.blur(
      screen.getAllByRole('button', { name: 'Dismiss notification' })[0]!,
      { relatedTarget: document.body },
    );
    fireEvent.click(
      screen.getByRole('button', { name: /Expand notifications/ }),
    );
    fireEvent.mouseEnter(document.querySelector('.echo-list')!);
    fireEvent.mouseLeave(region);
    expect(cards()[1]?.hidden).toBe(false);
    fireEvent.click(
      screen.getByRole('button', { name: /Collapse notifications/ }),
    );
    expect(cards()[1]?.hidden).toBe(true);
  });
  it('resumes hidden timers when expandable mode is turned off', () => {
    const { rerender } = render(<Toaster expandable duration={500} />);
    act(() => {
      notia.info('One');
      notia.info('Two');
    });
    rerender(<Toaster duration={500} />);
    expect(cards().every((card) => !card.hidden)).toBe(true);
    tick(680);
    expect(cards()).toHaveLength(0);
  });
  it('supports RTL and translated controls without changing physical placement', () => {
    render(
      <Toaster
        dir="rtl"
        position="top-left"
        expandable
        labels={{
          dismiss: 'إغلاق',
          expand: 'عرض الإشعارات',
          collapse: 'طي الإشعارات',
          progress: 'التقدم',
        }}
      />,
    );
    act(() => {
      notia.progress('جار الرفع');
      notia.info('تم الحفظ');
    });
    const region = screen.getByRole('region', { name: 'Notifications' });
    expect(region.getAttribute('dir')).toBe('rtl');
    expect(region.getAttribute('data-position')).toBe('top-left');
    expect(screen.getByRole('progressbar', { name: 'التقدم' })).toBeDefined();
    expect(screen.getByRole('button', { name: 'إغلاق' })).toBeDefined();
    fireEvent.click(screen.getByRole('button', { name: /عرض الإشعارات/ }));
    expect(
      screen
        .getByRole('button', { name: /طي الإشعارات/ })
        .getAttribute('aria-expanded'),
    ).toBe('true');
  });
});
