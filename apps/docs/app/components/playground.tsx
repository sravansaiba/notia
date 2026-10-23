'use client';
import { useState } from 'react';
import { notia, type Position, type Theme, type ToastType } from 'notia';
import { Code } from './code';
import { useClientReady } from './ready';
import { usePlaygroundSettings } from './providers';
function Arrow() {
  return <span aria-hidden="true">↗</span>;
}
const snippets = {
  basic: `import { notia } from 'notia';\n\n// A little feedback goes a long way.\nnotia.success('Your work, saved.', {\n  description: 'One less thing to think about.',\n});`,
  promise: `const result = await notia.promise(saveWork(), {\n  loading: 'Making it happen…',\n  success: 'Your work, saved.',\n  error: 'Something went wrong. Try again.',\n});`,
  custom: `notia.success('Made it your own.', {\n  description: 'Your product. Your personality.',\n  className: 'my-toast',\n  duration: 5000,\n});`,
};
const positions: Position[] = [
  'top-left',
  'top-center',
  'top-right',
  'bottom-left',
  'bottom-center',
  'bottom-right',
];
const examples: Record<ToastType, { message: string; description: string }> = {
  success: {
    message: 'Your work, saved.',
    description: 'One less thing to think about.',
  },
  error: {
    message: 'A small bump in the road.',
    description: 'Your changes are safe. Give it another try.',
  },
  info: {
    message: 'A little heads-up.',
    description: 'Your next great idea is one click away.',
  },
  warning: {
    message: 'Before you go…',
    description: 'You have a few unsaved changes.',
  },
  loading: {
    message: 'Making it happen…',
    description: 'Good things take a moment.',
  },
};

export function Playground() {
  const { position, setPosition, theme, setTheme, duration, setDuration } =
    usePlaygroundSettings();
  const ready = useClientReady();
  const [tab, setTab] = useState<keyof typeof snippets>('basic');
  const [type, setType] = useState<ToastType>('success');
  const [promiseFails, setPromiseFails] = useState(false);
  const [message, setMessage] = useState('');
  const show = (kind: ToastType = type) =>
    notia[kind](message.trim() || examples[kind].message, {
      description: examples[kind].description,
      ...(kind === 'loading' ? { id: 'playground-loading' } : {}),
      duration,
    });
  async function promiseToast() {
    await notia
      .promise(
        new Promise<string>((resolve, reject) =>
          setTimeout(
            () =>
              promiseFails
                ? reject(new Error('Demo failure'))
                : resolve('saved'),
            1600,
          ),
        ),
        {
          loading: 'Making it happen…',
          success: 'Your work, saved.',
          error: 'Could not save. Let’s try again.',
        },
        { duration },
      )
      .catch(() => {
        /* The demo intentionally exercises the rejection path. */
      });
  }

  return (
    <section
      id="playground"
      className="playground-section playground-page section-width"
    >
      <div className="section-heading">
        <div>
          <p className="kicker">LESS CONFIG. MORE CHARACTER.</p>
          <h1 className="page-title">Good feedback is a feeling.</h1>
          <p>Click around. Make some noise. Find your Notia.</p>
        </div>
        <span className="section-note">
          <span className="status-dot" /> Live playground
        </span>
      </div>
      <div className="playground">
        <div className="playground-controls">
          <div className="panel-heading">
            <span className="panel-number">01</span>
            <h2>Make it yours</h2>
            <span className="tiny-label">INTERACTIVE</span>
          </div>
          <div className="control-group">
            <span className="control-label" id="toast-type-label">
              Notification type
            </span>
            <div
              className="type-picker"
              role="group"
              aria-labelledby="toast-type-label"
            >
              {(
                ['success', 'error', 'info', 'warning', 'loading'] as const
              ).map((kind) => (
                <button
                  key={kind}
                  aria-pressed={type === kind}
                  onClick={() => setType(kind)}
                  className={`type-button ${type === kind ? 'selected' : ''}`}
                >
                  <span className={`type-dot type-${kind}`} />
                  <span>{kind.charAt(0).toUpperCase() + kind.slice(1)}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="control-row">
            <div className="control-group">
              <label htmlFor="position">Position</label>
              <select
                id="position"
                value={position}
                onChange={(event) =>
                  setPosition(event.target.value as Position)
                }
              >
                {positions.map((item) => (
                  <option key={item} value={item}>
                    {item.replace('-', ' ')}
                  </option>
                ))}
              </select>
            </div>
            <div className="control-group">
              <label htmlFor="theme">Theme</label>
              <select
                id="theme"
                value={theme}
                onChange={(event) => setTheme(event.target.value as Theme)}
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="system">System</option>
              </select>
            </div>
          </div>
          <div className="control-group">
            <label htmlFor="custom-message">
              Your message <span className="optional-label">(optional)</span>
            </label>
            <input
              className="message-input"
              id="custom-message"
              type="text"
              disabled={!ready}
              maxLength={1000}
              placeholder={examples[type].message}
              value={message}
              onChange={(event) => setMessage(event.target.value)}
            />
          </div>
          <div className="control-group range-label">
            <label htmlFor="duration">
              Duration <span>{duration / 1000}s</span>
            </label>
            <input
              id="duration"
              type="range"
              min="2000"
              max="10000"
              step="1000"
              value={duration}
              onChange={(event) => setDuration(Number(event.target.value))}
            />
          </div>
          <button
            className="button button-primary trigger-button"
            onClick={() => show()}
          >
            Toast it <span aria-hidden="true">↗</span>
          </button>
          <button className="text-button" onClick={() => notia.dismissAll()}>
            Clear notifications
          </button>
        </div>
        <div className="playground-code">
          <div className="panel-heading">
            <span className="panel-number">02</span>
            <h2>A few lines. That’s all.</h2>
          </div>
          <div className="code-tabs" role="tablist" aria-label="Code examples">
            {(['basic', 'promise', 'custom'] as const).map((key) => (
              <button
                id={`tab-${key}`}
                key={key}
                role="tab"
                aria-selected={tab === key}
                aria-controls="example-panel"
                tabIndex={tab === key ? 0 : -1}
                onClick={() => setTab(key)}
                onKeyDown={(event) => {
                  const keys = ['basic', 'promise', 'custom'] as const;
                  const index = keys.indexOf(key);
                  if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
                    event.preventDefault();
                    const next =
                      keys[(index + (event.key === 'ArrowRight' ? 1 : 2)) % 3]!;
                    setTab(next);
                    document.getElementById(`tab-${next}`)?.focus();
                  }
                }}
              >
                {key === 'basic'
                  ? 'The basics'
                  : key === 'promise'
                    ? 'Promises'
                    : 'Custom styling'}
              </button>
            ))}
          </div>
          <div
            role="tabpanel"
            id="example-panel"
            aria-labelledby={`tab-${tab}`}
          >
            <Code text={snippets[tab]} />
          </div>
          <div className="code-bottom-note">
            <span aria-hidden="true">✧</span> A familiar API. A fresh
            perspective.
          </div>
        </div>
      </div>
      <div className="promise-strip">
        <div>
          <span className="mini-icon" aria-hidden="true">
            ↻
          </span>
          <strong>Async, without the awkward.</strong>
          <span>One toast. Loading to done.</span>
        </div>
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={promiseFails}
            onChange={(event) => setPromiseFails(event.target.checked)}
          />{' '}
          Simulate an error
        </label>
        <button className="button button-outline" onClick={promiseToast}>
          Try a promise <Arrow />
        </button>
      </div>
    </section>
  );
}
