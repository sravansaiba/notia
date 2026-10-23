'use client';

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useSyncExternalStore,
  type PointerEvent,
} from 'react';
import { createPortal } from 'react-dom';
import { store } from '../core/store';
import type { Toast, ToasterProps, ToastType } from '../types';

const subscribeMounted = () => () => {};
const clientMounted = () => true;
const serverMounted = () => false;
const paths: Record<ToastType, string> = {
  success: 'm6 12 4 4 8-8',
  error: 'm8 8 8 8m0-8-8 8',
  info: 'M12 11v6m0-10v.1',
  warning: 'M12 7v6m0 4v.1',
  loading: 'M20 12a8 8 0 1 1-8-8',
};

function Icon({ type }: { type: ToastType }) {
  return (
    <svg
      className={`echo-icon echo-icon--${type}`}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[type]} />
    </svg>
  );
}

function ToastCard({ toast }: { toast: Toast }) {
  const ref = useRef<HTMLLIElement>(null);
  const origin = useRef<{ x: number; y: number; id: number } | null>(null);
  useLayoutEffect(() => {
    const previous = document.activeElement;
    const element = ref.current;
    return () => {
      if (
        element?.contains(document.activeElement) &&
        previous instanceof HTMLElement &&
        previous.isConnected
      )
        previous.focus();
    };
  }, []);
  const dismiss = () => {
    if (toast.dismissible !== false) store.dismiss(toast.id);
  };
  const finishSwipe = (event: PointerEvent<HTMLLIElement>) => {
    const start = origin.current;
    origin.current = null;
    store.resume(toast.id, 'pointer');
    if (
      start &&
      start.id === event.pointerId &&
      Math.abs(event.clientX - start.x) >= 64 &&
      Math.abs(event.clientY - start.y) < 40
    )
      dismiss();
  };
  return (
    <li
      ref={ref}
      className={`echo-toast ${toast.className ?? ''}`}
      data-type={toast.type}
      data-state={toast.state}
      data-toast-id={toast.id}
      onMouseEnter={() => store.pause(toast.id, 'hover')}
      onMouseLeave={() => store.resume(toast.id, 'hover')}
      onFocusCapture={() => store.pause(toast.id, 'focus')}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget))
          store.resume(toast.id, 'focus');
      }}
      onKeyDown={(event) => {
        if (event.key === 'Escape' && toast.dismissible !== false) {
          event.stopPropagation();
          dismiss();
        }
      }}
      onPointerDown={(event) => {
        if (
          toast.dismissible === false ||
          event.button !== 0 ||
          (event.target instanceof Element &&
            event.target.closest(
              'button,a,input,select,textarea,[role="button"]',
            ))
        )
          return;
        origin.current = {
          x: event.clientX,
          y: event.clientY,
          id: event.pointerId,
        };
        store.pause(toast.id, 'pointer');
        event.currentTarget.setPointerCapture?.(event.pointerId);
      }}
      onPointerUp={finishSwipe}
      onPointerCancel={() => {
        origin.current = null;
        store.resume(toast.id, 'pointer');
      }}
      onLostPointerCapture={() => {
        origin.current = null;
        store.resume(toast.id, 'pointer');
      }}
    >
      <span className="echo-icon-wrap">
        <Icon type={toast.type} />
      </span>
      <div className="echo-content">
        <div className="echo-message">{toast.message}</div>
        {toast.description != null && (
          <div className="echo-description">{toast.description}</div>
        )}
      </div>
      {toast.dismissible !== false && (
        <button
          type="button"
          className="echo-close"
          aria-label="Dismiss notification"
          onClick={dismiss}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            aria-hidden="true"
          >
            <path d="m5 5 10 10M15 5 5 15" />
          </svg>
        </button>
      )}
    </li>
  );
}

function announcement(toast: Toast) {
  if (toast.announcement !== undefined) return toast.announcement;
  return [
    typeof toast.message === 'string' || typeof toast.message === 'number'
      ? toast.message
      : toast.type === 'loading'
        ? 'Loading'
        : 'Notification',
    typeof toast.description === 'string' ? toast.description : '',
  ]
    .filter(Boolean)
    .join('. ');
}

export function Toaster({
  position = 'bottom-right',
  theme = 'system',
  maxVisible = 3,
  maxQueued = 20,
  duration = 4000,
  className = '',
  style,
  label = 'Notifications',
}: ToasterProps) {
  const mounted = useSyncExternalStore(
    subscribeMounted,
    clientMounted,
    serverMounted,
  );
  const toasts = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getServerSnapshot,
  );
  useEffect(
    () => store.attach({ maxVisible, maxQueued, duration }),
    [maxVisible, maxQueued, duration],
  );
  useEffect(() => {
    const update = () =>
      document.hidden ? store.pauseAll('hidden') : store.resumeAll('hidden');
    const blur = () => store.pauseAll('blur');
    const focus = () => store.resumeAll('blur');
    update();
    document.addEventListener('visibilitychange', update);
    window.addEventListener('blur', blur);
    window.addEventListener('focus', focus);
    return () => {
      document.removeEventListener('visibilitychange', update);
      window.removeEventListener('blur', blur);
      window.removeEventListener('focus', focus);
      store.resumeAll('hidden');
      store.resumeAll('blur');
    };
  }, []);
  if (!mounted) return null;
  const visible = toasts.filter((toast) => toast.state !== 'queued');
  return createPortal(
    <section
      className={`echo-root ${className}`}
      data-position={position}
      data-theme={theme}
      style={style}
      aria-label={label}
    >
      <ol className="echo-list">
        {visible.map((toast) => (
          <ToastCard key={toast.id} toast={toast} />
        ))}
      </ol>
      <div
        className="echo-sr-only"
        role="status"
        aria-live="polite"
        aria-atomic={false}
        aria-relevant="additions text"
      >
        {visible
          .filter(
            (toast) => toast.type !== 'error' && toast.state !== 'leaving',
          )
          .map((toast) => (
            <span key={toast.id} aria-atomic="true">
              {announcement(toast)}
            </span>
          ))}
      </div>
      <div
        className="echo-sr-only"
        role="alert"
        aria-live="assertive"
        aria-atomic={false}
        aria-relevant="additions text"
      >
        {visible
          .filter(
            (toast) => toast.type === 'error' && toast.state !== 'leaving',
          )
          .map((toast) => (
            <span key={toast.id} aria-atomic="true">
              {announcement(toast)}
            </span>
          ))}
      </div>
    </section>,
    document.body,
  );
}
