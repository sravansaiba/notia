'use client';

import type { ReactNode } from 'react';
import { store } from './core/store';
import type {
  ToastOptions,
  ToastType,
  ToastUpdate,
  PromiseMessages,
} from './types';

const browser = () => typeof window !== 'undefined';
const create =
  (type: ToastType) =>
  (message: ReactNode, options?: ToastOptions): string =>
    browser() ? store.add(type, message, options) : (options?.id ?? '');

export const notia = {
  success: create('success'),
  error: create('error'),
  info: create('info'),
  warning: create('warning'),
  loading: create('loading'),
  update: (id: string, options: ToastUpdate) => {
    if (browser()) store.update(id, options);
  },
  dismiss: (id: string) => {
    if (browser()) store.dismiss(id);
  },
  dismissAll: () => {
    if (browser()) store.dismissAll();
  },
  promise<T>(
    promise: Promise<T>,
    messages: PromiseMessages<T>,
    options?: ToastOptions,
  ): Promise<T> {
    const id = notia.loading(messages.loading, options);
    return promise.then(
      (value) => {
        notia.update(id, {
          type: 'success',
          message:
            typeof messages.success === 'function'
              ? messages.success(value)
              : messages.success,
        });
        return value;
      },
      (error: unknown) => {
        notia.update(id, {
          type: 'error',
          message:
            typeof messages.error === 'function'
              ? messages.error(error)
              : messages.error,
        });
        throw error;
      },
    );
  },
};

/** Compatibility alias for applications migrating from @sravan_saiba/echo. */
export const echo = notia;

export { Toaster } from './react/toaster';
export type {
  ToastOptions,
  ToastUpdate,
  ToastType,
  Position,
  Theme,
  ToasterProps,
  PromiseMessages,
} from './types';
