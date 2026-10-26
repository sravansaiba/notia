'use client';

import { useEffect, useSyncExternalStore } from 'react';

const eventName = 'notia-theme-change';
function subscribe(callback: () => void) {
  window.addEventListener(eventName, callback);
  return () => window.removeEventListener(eventName, callback);
}
function preference() {
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
}
function apply(value: string) {
  document.documentElement.dataset.theme = value === 'dark' ? 'dark' : 'light';
  window.dispatchEvent(new Event(eventName));
}
export function ThemeSwitch() {
  const value = useSyncExternalStore(subscribe, preference, () => 'light');
  useEffect(() => {
    const sync = () => {
      try {
        apply(localStorage.getItem('notia-theme') || 'light');
      } catch {
        /* Keep the current appearance when storage is unavailable. */
      }
    };
    sync();
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);
  const dark = value === 'dark';
  return (
    <button
      type="button"
      className="theme-switch"
      aria-label="Dark mode"
      aria-pressed={dark}
      title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      onClick={() => {
        const next = dark ? 'light' : 'dark';
        try {
          localStorage.setItem('notia-theme', next);
        } catch {
          /* The current page still changes. */
        }
        apply(next);
      }}
    >
      <svg
        className="theme-sun"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2m0 16v2M2 12h2m16 0h2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" />
      </svg>
      <svg
        className="theme-moon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M20.5 14.3A8.8 8.8 0 0 1 9.7 3.5 9 9 0 1 0 20.5 14.3Z" />
      </svg>
    </button>
  );
}
