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
export type ToastIcons = Partial<Record<ToastType, ReactNode>>;
export interface ToastAction {
  label: string;
  onClick: (id: string) => void | Promise<unknown>;
  /** Defaults to true. Failed actions remain available to retry. */
  dismiss?: boolean;
  errorMessage?: string;
}
export interface ToasterLabels {
  dismiss: string;
  expand: string;
  collapse: string;
  progress: string;
  actionError: string;
}
export interface ToastOptions {
  id?: string;
  /** Milliseconds; Infinity keeps a toast visible until dismissed. */
  duration?: number;
  description?: ReactNode;
  /** Plain text announced to screen readers; use for custom JSX. */
  announcement?: string;
  className?: string;
  dismissible?: boolean;
  action?: ToastAction | null;
  cancel?: ToastAction | null;
  /** Decorative icon. null or false hides the icon. */
  icon?: ReactNode;
  /** Percentage, clamped to 0–100. undefined removes the progress bar. */
  progress?: number | undefined;
  progressLabel?: string;
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
  instance: number;
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
  dir?: 'ltr' | 'rtl';
  lang?: string;
  icons?: ToastIcons;
  expandable?: boolean;
  labels?: Partial<ToasterLabels>;
}
export interface PromiseMessages<T> {
  loading: ReactNode;
  success: ReactNode | ((value: T) => ReactNode);
  error: ReactNode | ((error: unknown) => ReactNode);
}
