import type { ReactNode, CSSProperties } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning' | 'loading';
export type Position =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';
export type Theme = 'light' | 'dark' | 'system';
export interface ToastOptions {
  id?: string;
  /** Milliseconds; Infinity keeps a toast visible until dismissed. */
  duration?: number;
  description?: ReactNode;
  /** Plain text announced to screen readers; use for custom JSX. */
  announcement?: string;
  className?: string;
  dismissible?: boolean;
}
export interface ToastUpdate extends Omit<ToastOptions, 'id'> {
  type?: ToastType;
  message?: ReactNode;
}
export interface Toast extends ToastOptions {
  id: string;
  type: ToastType;
  message: ReactNode;
  state: 'queued' | 'visible' | 'leaving';
  revision: number;
}
export interface ToasterProps {
  position?: Position;
  theme?: Theme;
  maxVisible?: number;
  maxQueued?: number;
  duration?: number;
  className?: string;
  style?: CSSProperties;
  label?: string;
}
export interface PromiseMessages<T> {
  loading: ReactNode;
  success: ReactNode | ((value: T) => ReactNode);
  error: ReactNode | ((error: unknown) => ReactNode);
}
