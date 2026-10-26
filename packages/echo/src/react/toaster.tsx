'use client';

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useSyncExternalStore,
  useState,
  useId,
  type PointerEvent,
} from 'react';
import { createPortal } from 'react-dom';
import { store } from '../core/store';
import type {
  Toast,
  ToastAction,
  ToasterProps,
  ToastType,
  ToastIcons,
  ToasterLabels,
} from '../types';

const subscribeMounted = () => () => {};
const clientMounted = () => true;
const serverMounted = () => false;
const defaultLabels: ToasterLabels = {
  dismiss: 'Dismiss notification',
  expand: 'Expand notifications',
  collapse: 'Collapse notifications',
  progress: 'Progress',
  actionError: 'Action failed. Try again.',
};
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

function ToastCard({
  toast,
  hidden,
  icons,
  labels,
}: {
  toast: Toast;
  hidden: boolean;
  icons: ToastIcons | undefined;
  labels: ToasterLabels;
}) {
  const ref = useRef<HTMLLIElement>(null);
  const alive = useRef(true);
  const running = useRef(false);
  const clicked = useRef<HTMLButtonElement | null>(null);
  const [pending, setPending] = useState<string | null>(null);
  const icon = toast.icon !== undefined ? toast.icon : icons?.[toast.type];
  const progress =
    toast.progress === undefined
      ? undefined
      : Number.isFinite(toast.progress)
        ? Math.min(100, Math.max(0, toast.progress))
        : 0;
  useLayoutEffect(() => {
    if (
      clicked.current &&
      !clicked.current.isConnected &&
      document.activeElement === document.body
    ) {
      ref.current?.querySelector<HTMLButtonElement>('.echo-close')?.focus();
      clicked.current = null;
    }
  });
  useEffect(() => {
    if (hidden) store.pause(toast.id, 'stack-hidden');
    else store.resume(toast.id, 'stack-hidden');
    return () => store.resume(toast.id, 'stack-hidden');
  }, [hidden, toast.id]);
  const origin = useRef<{ x: number; y: number; id: number } | null>(null);
  useLayoutEffect(() => {
    alive.current = true;
    const previous = document.activeElement;
    const element = ref.current;
    return () => {
      alive.current = false;
      if (
        element?.contains(document.activeElement) &&
        previous instanceof HTMLElement &&
        previous.isConnected
      )
        previous.focus();
    };
  }, []);
  async function runAction(action: ToastAction, key: string) {
    if (running.current || toast.state !== 'visible') return;
    running.current = true;
    setPending(key);
    const reason = `action-${toast.instance}`;
    const current = () =>
      store
        .getSnapshot()
        .some(
          (item) =>
            item.id === toast.id &&
            item.instance === toast.instance &&
            item.state === 'visible',
        );
    store.pause(toast.id, reason);
    try {
      await action.onClick(toast.id);
      if (current() && action.dismiss !== false) store.dismiss(toast.id);
    } catch {
      if (current())
        store.update(toast.id, {
          type: 'error',
          message: action.errorMessage ?? labels.actionError,
          progress: undefined,
        });
    } finally {
      store.resume(toast.id, reason);
      if (alive.current) {
        running.current = false;
        setPending(null);
      }
    }
  }
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
      hidden={hidden}
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
      {icon !== null && icon !== false && (
        <span className="echo-icon-wrap" aria-hidden="true">
          {icon === undefined ? <Icon type={toast.type} /> : icon}
        </span>
      )}
      <div className="echo-content">
        <div className="echo-message">{toast.message}</div>
        {toast.description != null && (
          <div className="echo-description">{toast.description}</div>
        )}
        {progress !== undefined && (
          <div
            className="echo-progress"
            role="progressbar"
            aria-label={toast.progressLabel ?? labels.progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress}
          >
            <div className="echo-progress-track">
              <span style={{ transform: `scaleX(${progress / 100})` }} />
            </div>
            <span className="echo-progress-value">{Math.round(progress)}%</span>
          </div>
        )}
        {(toast.action || toast.cancel) && (
          <div className="echo-actions">
            {(
              [
                ['action', toast.action],
                ['cancel', toast.cancel],
              ] as const
            ).map(
              ([key, action]) =>
                action && (
                  <button
                    key={key}
                    type="button"
                    className="echo-action"
                    data-variant={key}
                    data-pending={pending === key}
                    aria-busy={pending === key}
                    aria-disabled={
                      pending !== null || toast.state === 'leaving'
                    }
                    onClick={(event) => {
                      if (event.currentTarget === document.activeElement)
                        clicked.current = event.currentTarget;
                      void runAction(action, key);
                    }}
                  >
                    {action.label}
                  </button>
                ),
            )}
          </div>
        )}
      </div>
      {toast.dismissible !== false && (
        <button
          type="button"
          className="echo-close"
          aria-label={labels.dismiss}
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
  dir,
  lang,
  icons,
  expandable = false,
  labels: customLabels,
}: ToasterProps) {
  const labels = { ...defaultLabels, ...customLabels };
  const listId = useId();
  const [pinned, setPinned] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [focused, setFocused] = useState(false);
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
  const visible = toasts.filter((toast) => toast.state !== 'queued');
  const canExpand = expandable && visible.length > 1;
  const expanded = pinned || hovering || focused;
  const collapsed = canExpand && !expanded;
  useEffect(() => {
    if (canExpand && expanded) store.pauseAll('stack-expanded');
    return () => store.resumeAll('stack-expanded');
  }, [canExpand, expanded]);
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
  return createPortal(
    <section
      className={`echo-root ${className}`}
      data-position={position}
      data-theme={theme}
      data-collapsed={collapsed}
      dir={dir}
      lang={lang}
      onMouseLeave={() => setHovering(false)}
      style={style}
      aria-label={label}
    >
      <ol
        className="echo-list"
        id={listId}
        onMouseEnter={() => {
          if (expandable) setHovering(true);
        }}
        onFocusCapture={() => {
          if (expandable) setFocused(true);
        }}
        onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget))
            setFocused(false);
        }}
      >
        {visible.map((toast, index) => (
          <ToastCard
            key={`${toast.id}:${toast.instance}`}
            toast={toast}
            hidden={collapsed && index > 0}
            icons={icons}
            labels={labels}
          />
        ))}
      </ol>
      {canExpand && (
        <button
          type="button"
          className="echo-expand"
          aria-expanded={expanded}
          aria-controls={listId}
          onClick={() => {
            setPinned(!expanded);
            setHovering(false);
          }}
        >
          {expanded ? labels.collapse : labels.expand}{' '}
          <span aria-hidden="true">({visible.length})</span>
        </button>
      )}
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
