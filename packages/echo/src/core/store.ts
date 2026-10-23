import type { ReactNode } from 'react';
import type { Toast, ToastOptions, ToastType, ToastUpdate } from '../types';

type Config = { maxVisible: number; maxQueued: number; duration: number };
type Clock = {
  remaining: number;
  started: number;
  timer?: ReturnType<typeof setTimeout>;
  pauses: Set<string>;
};
const EMPTY: readonly Toast[] = [];
const defaults: Config = { maxVisible: 3, maxQueued: 20, duration: 4000 };
const positive = (value: number, fallback: number) =>
  Number.isInteger(value) && value > 0 ? value : fallback;
const validDuration = (value: number) =>
  value === Infinity || (Number.isFinite(value) && value >= 0);

/** No browser globals; the exported browser API guards server mutations. */
export function createStore() {
  let snapshot: readonly Toast[] = EMPTY;
  let config = { ...defaults };
  let host = false;
  let sequence = 0;
  const listeners = new Set<() => void>();
  const clocks = new Map<string, Clock>();
  const exits = new Map<string, ReturnType<typeof setTimeout>>();
  const globalPauses = new Set<string>();
  const emit = () => listeners.forEach((listener) => listener());
  const durationFor = (toast: Toast) =>
    toast.type === 'loading'
      ? Infinity
      : validDuration(toast.duration ?? config.duration)
        ? (toast.duration ?? config.duration)
        : config.duration;
  function stop(clock: Clock) {
    if (clock.timer !== undefined) {
      clearTimeout(clock.timer);
      delete clock.timer;
      clock.remaining = Math.max(
        0,
        clock.remaining - (Date.now() - clock.started),
      );
    }
  }
  function start(id: string, clock: Clock) {
    if (
      !host ||
      globalPauses.size ||
      clock.pauses.size ||
      clock.timer !== undefined ||
      clock.remaining === Infinity
    )
      return;
    clock.started = Date.now();
    clock.timer = setTimeout(() => {
      delete clock.timer;
      dismiss(id);
    }, clock.remaining);
  }
  function promote() {
    if (!host) return;
    let slots =
      config.maxVisible -
      snapshot.filter((toast) => toast.state !== 'queued').length;
    snapshot = snapshot.map((toast) => {
      if (toast.state !== 'queued' || slots <= 0) return toast;
      slots--;
      const clock: Clock = {
        remaining: durationFor(toast),
        started: Date.now(),
        pauses: new Set(),
      };
      clocks.set(toast.id, clock);
      start(toast.id, clock);
      return { ...toast, state: 'visible' };
    });
  }
  function remove(id: string) {
    const clock = clocks.get(id);
    if (clock) stop(clock);
    clocks.delete(id);
    clearTimeout(exits.get(id));
    exits.delete(id);
    snapshot = snapshot.filter((toast) => toast.id !== id);
    promote();
    emit();
  }
  function dismiss(id: string) {
    const toast = snapshot.find((item) => item.id === id);
    if (!toast || toast.state === 'leaving') return;
    if (toast.state === 'queued' || !host) return remove(id);
    const clock = clocks.get(id);
    if (clock) stop(clock);
    clocks.delete(id);
    snapshot = snapshot.map((item) =>
      item.id === id ? { ...item, state: 'leaving' } : item,
    );
    exits.set(
      id,
      setTimeout(() => remove(id), 180),
    );
    emit();
  }
  function update(id: string, options: ToastUpdate) {
    const toast = snapshot.find((item) => item.id === id);
    if (!toast || toast.state === 'leaving') return;
    const next = { ...toast, ...options, id, revision: toast.revision + 1 };
    snapshot = snapshot.map((item) => (item.id === id ? next : item));
    const clock = clocks.get(id);
    if (
      clock &&
      (options.type !== undefined || options.duration !== undefined)
    ) {
      stop(clock);
      clock.remaining = durationFor(next);
      start(id, clock);
    }
    emit();
  }
  return {
    getSnapshot: () => snapshot,
    getServerSnapshot: () => EMPTY,
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    add(type: ToastType, message: ReactNode, options: ToastOptions = {}) {
      let id = options.id;
      if (id === undefined) {
        do {
          id = `echo-${++sequence}`;
        } while (snapshot.some((toast) => toast.id === id));
      }
      if (snapshot.some((toast) => toast.id === id)) {
        update(id, { ...options, type, message });
        return id;
      }
      const queued = snapshot.filter((toast) => toast.state === 'queued');
      if (queued.length >= config.maxQueued && queued[0])
        snapshot = snapshot.filter((toast) => toast.id !== queued[0]?.id);
      snapshot = [
        ...snapshot,
        { ...options, id, type, message, state: 'queued', revision: 0 },
      ];
      promote();
      emit();
      return id;
    },
    update,
    dismiss,
    dismissAll() {
      for (const clock of clocks.values()) stop(clock);
      for (const timer of exits.values()) clearTimeout(timer);
      clocks.clear();
      exits.clear();
      snapshot = EMPTY;
      emit();
    },
    pause(id: string, reason: string) {
      const clock = clocks.get(id);
      if (clock) {
        stop(clock);
        clock.pauses.add(reason);
      }
    },
    resume(id: string, reason: string) {
      const clock = clocks.get(id);
      if (clock) {
        clock.pauses.delete(reason);
        start(id, clock);
      }
    },
    pauseAll(reason: string) {
      globalPauses.add(reason);
      clocks.forEach(stop);
    },
    resumeAll(reason: string) {
      globalPauses.delete(reason);
      clocks.forEach((clock, id) => start(id, clock));
    },
    attach(options: Partial<Config> = {}) {
      if (host)
        throw new Error('Echo supports one mounted Toaster per application.');
      config = {
        maxVisible: positive(
          options.maxVisible ?? defaults.maxVisible,
          defaults.maxVisible,
        ),
        maxQueued: positive(
          options.maxQueued ?? defaults.maxQueued,
          defaults.maxQueued,
        ),
        duration: validDuration(options.duration ?? defaults.duration)
          ? (options.duration ?? defaults.duration)
          : defaults.duration,
      };
      host = true;
      let visible = 0;
      snapshot = snapshot.map((toast) => {
        if (toast.state === 'queued' || toast.state === 'leaving') return toast;
        if (++visible <= config.maxVisible) return toast;
        const clock = clocks.get(toast.id);
        if (clock) stop(clock);
        clocks.delete(toast.id);
        return { ...toast, state: 'queued' };
      });
      promote();
      const overflow = snapshot
        .filter((toast) => toast.state === 'queued')
        .slice(0, -config.maxQueued);
      const discarded = new Set(overflow.map((toast) => toast.id));
      snapshot = snapshot.filter((toast) => !discarded.has(toast.id));
      clocks.forEach((clock, id) => start(id, clock));
      emit();
      return () => {
        host = false;
        clocks.forEach(stop);
      };
    },
  };
}

export const store = createStore();
