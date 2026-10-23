// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createStore } from '../../packages/echo/src/core/store';

let store: ReturnType<typeof createStore>;
beforeEach(() => {
  vi.useFakeTimers();
  store = createStore();
});
afterEach(() => {
  store.dismissAll();
  vi.useRealTimers();
});
const tick = (ms: number) => vi.advanceTimersByTime(ms);

describe('store identity and lifecycle', () => {
  it('caches immutable snapshots, notifies subscribers and unsubscribes', () => {
    const listener = vi.fn();
    const unsubscribe = store.subscribe(listener);
    const initial = store.getSnapshot();
    expect(store.getSnapshot()).toBe(initial);
    store.add('info', 'hello');
    const next = store.getSnapshot();
    expect(next).not.toBe(initial);
    expect(initial).toEqual([]);
    expect(listener).toHaveBeenCalledTimes(1);
    expect(store.getSnapshot()).toBe(next);
    expect(store.getServerSnapshot()).toEqual([]);
    const server = store.getServerSnapshot();
    store.add('success', 'next');
    expect(store.getServerSnapshot()).toBe(server);
    unsubscribe();
    store.add('info', 'last');
    expect(listener).toHaveBeenCalledTimes(2);
  });
  it('queues before mounting and starts the clock on activation', () => {
    store.add('info', 'hello');
    tick(10000);
    expect(store.getSnapshot()[0]?.state).toBe('queued');
    store.attach();
    tick(3999);
    expect(store.getSnapshot()[0]?.state).toBe('visible');
    tick(1);
    expect(store.getSnapshot()[0]?.state).toBe('leaving');
    tick(180);
    expect(store.getSnapshot()).toEqual([]);
  });
  it('generates distinct IDs even when an explicit ID uses the generated prefix', () => {
    store.add('info', 'explicit', { id: 'echo-1' });
    const id = store.add('success', 'generated');
    expect(id).not.toBe('echo-1');
    expect(store.getSnapshot()).toHaveLength(2);
  });
  it('updates an explicit duplicate in place, including a queued toast', () => {
    const id = store.add('info', 'first', { id: 'same' });
    store.add('error', 'second', { id: 'same' });
    expect(store.getSnapshot()).toHaveLength(1);
    expect(store.getSnapshot()[0]).toMatchObject({
      id,
      type: 'error',
      message: 'second',
      revision: 1,
    });
  });
  it('does not merge matching text with distinct IDs', () => {
    store.add('info', 'same');
    store.add('info', 'same');
    expect(store.getSnapshot()).toHaveLength(2);
  });
  it('ignores unknown updates, unknown dismissals, and leaving updates', () => {
    store.attach();
    store.update('missing', { message: 'no' });
    store.dismiss('missing');
    const id = store.add('info', 'original');
    store.dismiss(id);
    store.update(id, { message: 'revived' });
    store.dismiss(id);
    expect(store.getSnapshot()[0]?.message).toBe('original');
    tick(180);
    expect(store.getSnapshot()).toHaveLength(0);
  });
  it('clears all queued, visible, and leaving toasts and their timers', () => {
    store.attach({ maxVisible: 2 });
    const id = store.add('info', 'one');
    store.add('info', 'two');
    store.add('info', 'three');
    store.dismiss(id);
    store.dismissAll();
    expect(store.getSnapshot()).toEqual([]);
    expect(vi.getTimerCount()).toBe(0);
    tick(10000);
    expect(store.getSnapshot()).toEqual([]);
  });
  it('allows exactly one host and clean Strict Mode attach/detach cycles', () => {
    const detach = store.attach();
    expect(() => store.attach()).toThrow('one mounted Toaster');
    detach();
    const detachAgain = store.attach();
    detachAgain();
  });
});

describe('FIFO queue and bounded memory', () => {
  it('applies smaller limits when reconfigured, without leaking timers', () => {
    const detach = store.attach({ maxVisible: 3 });
    for (let i = 0; i < 8; i++) store.add('info', String(i));
    detach();
    store.attach({ maxVisible: 1, maxQueued: 2 });
    expect(
      store.getSnapshot().filter((toast) => toast.state === 'visible'),
    ).toHaveLength(1);
    expect(
      store.getSnapshot().filter((toast) => toast.state === 'queued'),
    ).toHaveLength(2);
    expect(vi.getTimerCount()).toBe(1);
  });
  it('promotes in FIFO order only when an exit finishes', () => {
    store.attach({ maxVisible: 1 });
    const first = store.add('info', 'one', { duration: 100 });
    store.add('info', 'two');
    store.add('info', 'three');
    tick(100);
    expect(store.getSnapshot()[0]?.state).toBe('leaving');
    expect(store.getSnapshot()[1]?.state).toBe('queued');
    tick(180);
    expect(
      store.getSnapshot().map((toast) => [toast.message, toast.state]),
    ).toEqual([
      ['two', 'visible'],
      ['three', 'queued'],
    ]);
    store.dismiss(first);
    expect(store.getSnapshot()).toHaveLength(2);
  });
  it('drops the oldest queued entry when its capacity is reached', () => {
    store.attach({ maxVisible: 1, maxQueued: 2 });
    store.add('loading', 'active');
    store.add('info', 'oldest');
    store.add('info', 'middle');
    store.add('info', 'newest');
    expect(store.getSnapshot().map((toast) => toast.message)).toEqual([
      'active',
      'middle',
      'newest',
    ]);
  });
  it('bounds pre-mount entries too', () => {
    for (let i = 0; i < 30; i++) store.add('info', String(i));
    expect(store.getSnapshot()).toHaveLength(20);
    expect(store.getSnapshot()[0]?.message).toBe('10');
  });
  it('removes queued entries immediately without an exit timer', () => {
    const id = store.add('info', 'queued');
    store.dismiss(id);
    expect(store.getSnapshot()).toEqual([]);
    expect(vi.getTimerCount()).toBe(0);
  });
  it('uses defaults for invalid limits and duration', () => {
    store.attach({ maxVisible: 0, maxQueued: -1, duration: NaN });
    for (let i = 0; i < 5; i++) store.add('info', String(i));
    expect(
      store.getSnapshot().filter((toast) => toast.state === 'visible'),
    ).toHaveLength(3);
    tick(4000);
    expect(store.getSnapshot()[0]?.state).toBe('leaving');
  });
});

describe('timer semantics', () => {
  it('keeps loading and Infinity-duration toasts until dismissed', () => {
    store.attach();
    store.add('loading', 'wait', { duration: 5 });
    store.add('info', 'persistent', { duration: Infinity });
    tick(1000000);
    expect(
      store.getSnapshot().every((toast) => toast.state === 'visible'),
    ).toBe(true);
  });
  it('uses per-toast durations and rejects invalid durations', () => {
    store.attach({ duration: 500 });
    store.add('info', 'short', { duration: 100 });
    store.add('info', 'invalid', { duration: -2 });
    tick(100);
    expect(store.getSnapshot()[0]?.state).toBe('leaving');
    expect(store.getSnapshot()[1]?.state).toBe('visible');
    tick(400);
    expect(store.getSnapshot()[0]?.state).toBe('leaving');
  });
  it('supports a zero duration', () => {
    store.attach();
    store.add('info', 'instant', { duration: 0 });
    tick(0);
    expect(store.getSnapshot()[0]?.state).toBe('leaving');
  });
  it('preserves remaining duration for content-only updates', () => {
    store.attach();
    const id = store.add('info', 'first', { duration: 1000 });
    tick(600);
    store.update(id, { message: 'changed' });
    tick(400);
    expect(store.getSnapshot()[0]?.state).toBe('leaving');
  });
  it('starts a fresh timer when loading resolves', () => {
    store.attach({ duration: 700 });
    const id = store.add('loading', 'wait');
    tick(10000);
    store.update(id, { type: 'success', message: 'done' });
    tick(699);
    expect(store.getSnapshot()[0]?.state).toBe('visible');
    tick(1);
    expect(store.getSnapshot()[0]?.state).toBe('leaving');
  });
  it('resets duration explicitly and can return to loading', () => {
    store.attach();
    const id = store.add('info', 'first', { duration: 1000 });
    tick(600);
    store.update(id, { duration: 2000 });
    tick(1999);
    expect(store.getSnapshot()[0]?.state).toBe('visible');
    store.update(id, { type: 'loading' });
    tick(10000);
    expect(store.getSnapshot()[0]?.state).toBe('visible');
  });
  it('combines hover, focus, and global pauses without resuming early', () => {
    store.attach();
    const id = store.add('info', 'hello', { duration: 1000 });
    tick(400);
    store.pause(id, 'hover');
    store.pause(id, 'focus');
    store.pauseAll('hidden');
    tick(10000);
    store.resume(id, 'hover');
    store.resumeAll('hidden');
    tick(10000);
    expect(store.getSnapshot()[0]?.state).toBe('visible');
    store.resume(id, 'focus');
    tick(599);
    expect(store.getSnapshot()[0]?.state).toBe('visible');
    tick(1);
    expect(store.getSnapshot()[0]?.state).toBe('leaving');
  });
  it('does not duplicate timers when resumed repeatedly', () => {
    store.attach();
    const id = store.add('info', 'hello');
    store.resume(id, 'none');
    store.resumeAll('none');
    expect(vi.getTimerCount()).toBe(1);
    store.pause('missing', 'hover');
    store.resume('missing', 'hover');
  });
  it('pauses newly promoted entries while the page is hidden', () => {
    store.attach();
    store.pauseAll('hidden');
    store.add('info', 'hello', { duration: 100 });
    tick(1000);
    expect(store.getSnapshot()[0]?.state).toBe('visible');
    store.resumeAll('hidden');
    tick(100);
    expect(store.getSnapshot()[0]?.state).toBe('leaving');
  });
  it('freezes timers when unmounted and resumes remaining time on reattach', () => {
    const detach = store.attach();
    const id = store.add('info', 'hello', { duration: 1000 });
    tick(300);
    detach();
    tick(10000);
    store.attach();
    tick(699);
    expect(store.getSnapshot()[0]?.state).toBe('visible');
    tick(1);
    expect(store.getSnapshot()[0]?.state).toBe('leaving');
    store.dismiss(id);
  });
  it('removes an active entry immediately if its host has unmounted', () => {
    const detach = store.attach();
    const id = store.add('info', 'hello');
    detach();
    store.dismiss(id);
    expect(store.getSnapshot()).toEqual([]);
  });
  it('can update while paused without restarting prematurely', () => {
    store.attach();
    const id = store.add('info', 'hello');
    store.pause(id, 'hover');
    store.update(id, { duration: 200 });
    tick(10000);
    expect(store.getSnapshot()[0]?.state).toBe('visible');
    store.resume(id, 'hover');
    tick(200);
    expect(store.getSnapshot()[0]?.state).toBe('leaving');
  });
});
