'use client';
import { useState } from 'react';
import { notia, type Position, type Theme, type ToastType } from 'notia';
import { Code } from './code';
import { useClientReady } from './ready';
import { usePlaygroundSettings } from './providers';
import { LiveExample } from './live-example';
import { exampleSources } from '../lib/example-sources';
import type { ExampleName } from '../lib/guides';
function Arrow() {
  return <span aria-hidden="true">↗</span>;
}
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

function MessagePlayground() {
  const { position, setPosition, theme, setTheme, duration, setDuration } =
    usePlaygroundSettings();
  const ready = useClientReady();
  const [tab, setTab] = useState<'basic' | 'promise'>('basic');
  const [type, setType] = useState<ToastType>('success');
  const [promiseFails, setPromiseFails] = useState(false);
  const [message, setMessage] = useState('');
  const generatedCode = `'use client';
import { notia, Toaster } from 'notia';
import 'notia/styles.css';

export default function App() {
  return <>
    <button onClick={() => notia.${type}(${JSON.stringify(message.trim() || examples[type].message)}, {
      description: ${JSON.stringify(examples[type].description)},
      duration: ${duration},${type === 'loading' ? "\n      id: 'playground-loading'," : ''}
    })}>Show notification</button>
    <Toaster position="${position}" theme="${theme}" duration={${duration}} />
  </>;
}`;
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
    <section id="playground" className="message-playground">
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
            {(['basic', 'promise'] as const).map((key) => (
              <button
                id={`tab-${key}`}
                key={key}
                role="tab"
                aria-selected={tab === key}
                aria-controls="example-panel"
                tabIndex={tab === key ? 0 : -1}
                onClick={() => setTab(key)}
                onKeyDown={(event) => {
                  const keys = ['basic', 'promise'] as const;
                  const index = keys.indexOf(key);
                  if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
                    event.preventDefault();
                    const next =
                      keys[
                        (index +
                          (event.key === 'ArrowRight' ? 1 : keys.length - 1)) %
                          keys.length
                      ]!;
                    setTab(next);
                    document.getElementById(`tab-${next}`)?.focus();
                  }
                }}
              >
                {key === 'basic' ? 'The basics' : 'Promises'}
              </button>
            ))}
          </div>
          <div
            role="tabpanel"
            id="example-panel"
            aria-labelledby={`tab-${tab}`}
          >
            <Code
              text={
                tab === 'basic'
                  ? generatedCode
                  : exampleSources.promises.typescript
              }
              javascript={
                tab === 'promise'
                  ? exampleSources.promises.javascript
                  : generatedCode
              }
              label="App.tsx"
            />
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

const categories = [
  ['messages', 'Messages'],
  ['actions', 'Actions'],
  ['progress', 'Progress'],
  ['icons', 'Icons'],
  ['stacks', 'Stacks'],
  ['rtl', 'RTL'],
] as const;
export function Playground() {
  const [category, setCategory] =
    useState<(typeof categories)[number][0]>('messages');
  function select(next: typeof category) {
    notia.dismissAll();
    setCategory(next);
  }
  return (
    <section className="playground-page section-width">
      <div className="section-heading">
        <div>
          <p className="kicker">TRY IT. MAKE IT YOURS.</p>
          <h1 className="page-title">A small message. A useful next step.</h1>
          <p>
            Choose an example, try its controls, then copy the working code.
          </p>
        </div>
      </div>
      <div
        className="playground-category"
        role="group"
        aria-label="Playground examples"
      >
        {categories.map(([key, title], index) => (
          <button
            key={key}
            aria-pressed={category === key}
            onClick={() => select(key)}
            onKeyDown={(event) => {
              if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft')
                return;
              event.preventDefault();
              const next =
                categories[
                  (index +
                    (event.key === 'ArrowRight' ? 1 : categories.length - 1)) %
                    categories.length
                ]!;
              select(next[0]);
              (
                event.currentTarget.parentElement?.children[
                  (index +
                    (event.key === 'ArrowRight' ? 1 : categories.length - 1)) %
                    categories.length
                ] as HTMLButtonElement
              )?.focus();
            }}
          >
            {title}
          </button>
        ))}
      </div>
      {category === 'messages' ? (
        <MessagePlayground />
      ) : (
        <LiveExample
          key={category}
          name={category as ExampleName}
          title={categories.find(([key]) => key === category)![1]}
        />
      )}
    </section>
  );
}
