import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
import { StrictMode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { notia, echo, Toaster } from '../../packages/echo/src/index';
import { store } from '../../packages/echo/src/core/store';

beforeEach(() => {
  vi.useFakeTimers();
});
afterEach(() => {
  cleanup();
  store.dismissAll();
  vi.useRealTimers();
});
const tick = (ms: number) =>
  act(() => {
    vi.advanceTimersByTime(ms);
  });

describe('React rendering and interactions', () => {
  it('shares notification lifecycle between the Notia API and the legacy alias', () => {
    render(<Toaster />);
    let id = '';
    act(() => {
      id = notia.loading('Moving to Notia');
    });
    act(() => {
      echo.update(id, { type: 'success', message: 'Migration complete' });
    });
    expect(document.querySelector('.echo-message')?.textContent).toBe(
      'Migration complete',
    );
    expect(document.querySelectorAll('.echo-toast')).toHaveLength(1);
    act(() => {
      notia.dismissAll();
    });
    expect(document.querySelectorAll('.echo-toast')).toHaveLength(0);
  });
  it('survives Strict Mode and renders browser calls made before mounting', () => {
    act(() => {
      echo.success('Saved');
    });
    render(
      <StrictMode>
        <Toaster />
      </StrictMode>,
    );
    expect(document.querySelector('.echo-message')?.textContent).toBe('Saved');
    expect(document.querySelectorAll('.echo-toast')).toHaveLength(1);
  });
  it('announces errors assertively and routine messages politely', () => {
    render(<Toaster />);
    act(() => {
      echo.info('Heads up');
      echo.error('Failure');
    });
    expect(screen.getByRole('status').textContent).toContain('Heads up');
    expect(screen.getByRole('alert').textContent).toBe('Failure');
    expect(document.querySelectorAll('[role="alert"]')).toHaveLength(1);
  });
  it('renders custom JSX and uses the provided plain text announcement', () => {
    render(<Toaster />);
    act(() => {
      echo.success(<strong>Custom content</strong>, {
        announcement: 'Task complete',
        description: 'Details',
        className: 'custom-toast',
      });
    });
    expect(screen.getByRole('status').textContent).toBe('Task complete');
    expect(document.querySelector('.custom-toast strong')?.textContent).toBe(
      'Custom content',
    );
  });
  it('provides a generic announcement for JSX without explicit text', () => {
    render(<Toaster />);
    act(() => {
      echo.info(<b>Complex</b>);
      echo.loading(<b>Wait</b>);
    });
    expect(screen.getByRole('status').textContent).toBe('NotificationLoading');
  });
  it('dismisses with the close button and scoped Escape', () => {
    render(<Toaster />);
    act(() => {
      echo.success('Saved');
    });
    const close = screen.getByRole('button', { name: 'Dismiss notification' });
    fireEvent.keyDown(document.body, { key: 'Escape' });
    expect(
      document.querySelector('.echo-toast')?.getAttribute('data-state'),
    ).toBe('visible');
    fireEvent.keyDown(close, { key: 'Escape' });
    tick(180);
    expect(document.querySelectorAll('.echo-toast')).toHaveLength(0);
    act(() => {
      echo.info('Another');
    });
    fireEvent.click(
      screen.getByRole('button', { name: 'Dismiss notification' }),
    );
    tick(180);
    expect(document.querySelectorAll('.echo-toast')).toHaveLength(0);
  });
  it('never steals focus on creation', () => {
    render(
      <>
        <button>Trigger</button>
        <Toaster />
      </>,
    );
    const button = screen.getByText('Trigger');
    button.focus();
    act(() => {
      echo.success('Saved');
    });
    expect(document.activeElement).toBe(button);
  });
  it('pauses on hover and focus and waits for both to clear', () => {
    render(<Toaster duration={1000} />);
    act(() => {
      echo.info('Pause');
    });
    const card = document.querySelector('.echo-toast')!;
    const button = screen.getByRole('button', { name: 'Dismiss notification' });
    tick(500);
    fireEvent.mouseEnter(card);
    fireEvent.focus(button);
    tick(10000);
    fireEvent.mouseLeave(card);
    tick(10000);
    expect(card.getAttribute('data-state')).toBe('visible');
    fireEvent.blur(button, { relatedTarget: document.body });
    tick(500);
    expect(card.getAttribute('data-state')).toBe('leaving');
  });
  it('pauses when the window loses focus', () => {
    render(<Toaster duration={500} />);
    act(() => {
      echo.success('Pause');
    });
    fireEvent(window, new Event('blur'));
    tick(1000);
    expect(
      document.querySelector('.echo-toast')?.getAttribute('data-state'),
    ).toBe('visible');
    fireEvent(window, new Event('focus'));
    tick(500);
    expect(
      document.querySelector('.echo-toast')?.getAttribute('data-state'),
    ).toBe('leaving');
  });
  it('updates theme and position, disables user dismissal when requested', () => {
    const { rerender } = render(<Toaster theme="light" />);
    act(() => {
      echo.loading('Working', { dismissible: false });
    });
    expect(
      screen.queryByRole('button', { name: 'Dismiss notification' }),
    ).toBeNull();
    rerender(<Toaster theme="dark" position="top-center" />);
    expect(
      document.querySelector('.echo-root')?.getAttribute('data-theme'),
    ).toBe('dark');
    expect(
      document.querySelector('.echo-root')?.getAttribute('data-position'),
    ).toBe('top-center');
  });
  it('clears visible and queued entries', () => {
    render(<Toaster maxVisible={1} />);
    act(() => {
      echo.info('First');
      echo.info('Second');
    });
    expect(document.querySelectorAll('.echo-toast')).toHaveLength(1);
    act(() => {
      echo.dismissAll();
    });
    expect(document.querySelectorAll('.echo-toast')).toHaveLength(0);
    expect(store.getSnapshot()).toEqual([]);
  });
});

describe('promise API', () => {
  it('updates one toast and preserves the fulfilled value', async () => {
    render(<Toaster />);
    const user = { name: 'Sravan' };
    let resolve!: (value: typeof user) => void;
    const promise = new Promise<typeof user>((done) => {
      resolve = done;
    });
    let result!: Promise<typeof user>;
    act(() => {
      result = echo.promise(promise, {
        loading: 'Waiting',
        success: (value) => `Hello ${value.name}`,
        error: 'Failed',
      });
    });
    const id = store.getSnapshot()[0]?.id;
    await act(async () => {
      resolve(user);
      expect(await result).toBe(user);
    });
    expect(store.getSnapshot()).toHaveLength(1);
    expect(store.getSnapshot()[0]).toMatchObject({
      id,
      type: 'success',
      message: 'Hello Sravan',
    });
  });
  it('preserves rejection and supports an error formatter', async () => {
    render(<Toaster />);
    const error = new Error('Broken');
    await act(async () => {
      await expect(
        echo.promise(Promise.reject(error), {
          loading: 'Wait',
          success: 'Done',
          error: (cause) =>
            cause instanceof Error ? cause.message : 'Unknown',
        }),
      ).rejects.toBe(error);
    });
    expect(store.getSnapshot()[0]).toMatchObject({
      type: 'error',
      message: 'Broken',
    });
  });
  it('handles static success/error messages and does not revive a dismissed promise', async () => {
    render(<Toaster />);
    await act(async () => {
      await echo.promise(Promise.resolve(1), {
        loading: 'Wait',
        success: 'Done',
        error: 'Oops',
      });
    });
    expect(store.getSnapshot()[0]?.message).toBe('Done');
    await act(async () => {
      await echo
        .promise(Promise.reject(new Error('No')), {
          loading: 'Wait',
          success: 'Done',
          error: 'Oops',
        })
        .catch(() => {});
    });
    expect(store.getSnapshot()[1]?.message).toBe('Oops');
    let resolve!: (value: number) => void;
    let result!: Promise<number>;
    act(() => {
      result = echo.promise(
        new Promise<number>((done) => {
          resolve = done;
        }),
        { loading: 'Wait', success: 'Done', error: 'Oops' },
        { id: 'promise' },
      );
      echo.dismiss('promise');
    });
    await act(async () => {
      resolve(2);
      await result;
    });
    tick(180);
    expect(store.getSnapshot().some((toast) => toast.id === 'promise')).toBe(
      false,
    );
  });
});
