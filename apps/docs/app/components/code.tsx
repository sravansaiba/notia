'use client';
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { useClientReady } from './ready';
const change = 'notia-code-language';
let fallbackLanguage = 'ts';
function subscribe(callback: () => void) {
  window.addEventListener(change, callback);
  window.addEventListener('storage', callback);
  return () => {
    window.removeEventListener(change, callback);
    window.removeEventListener('storage', callback);
  };
}
function language() {
  try {
    return (localStorage.getItem('notia-code-language') || fallbackLanguage) ===
      'js'
      ? 'js'
      : 'ts';
  } catch {
    return fallbackLanguage;
  }
}
function Highlight({ text }: { text: string }) {
  const tokens = text.split(
    /(\/\/[^\n]*|'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|\b(?:import|from|export|default|function|const|let|return|if|else|await|async|try|catch|throw|new|true|false|null|undefined|type|interface)\b|\b\d+\b)/g,
  );
  return (
    <>
      {tokens.map((token, index) => (
        <span
          key={index}
          className={
            token.startsWith('//')
              ? 'syntax-comment'
              : /^["']/.test(token)
                ? 'syntax-string'
                : /^(import|from|export|default|function|const|let|return|if|else|await|async|try|catch|throw|new|true|false|null|undefined|type|interface)$/.test(
                      token,
                    )
                  ? 'syntax-keyword'
                  : /^\d+$/.test(token)
                    ? 'syntax-number'
                    : undefined
          }
        >
          {token}
        </span>
      ))}
    </>
  );
}
export function Code({
  text,
  javascript,
  label = 'Example.tsx',
}: {
  text: string;
  javascript?: string;
  label?: string;
}) {
  const ready = useClientReady();
  const selected = useSyncExternalStore(subscribe, language, () => 'ts');
  const [status, setStatus] = useState('');
  const timeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timeout.current), []);
  const content =
    selected === 'js' && javascript !== undefined ? javascript : text;
  const filename =
    selected === 'js' && javascript !== undefined
      ? label.replace(/\.tsx/g, '.jsx').replace(/\.ts\b/g, '.js')
      : label;
  async function copy() {
    try {
      await navigator.clipboard.writeText(content);
      setStatus('Copied');
    } catch {
      setStatus('Select the text to copy');
    }
    clearTimeout(timeout.current);
    timeout.current = setTimeout(() => setStatus(''), 2000);
  }
  return (
    <div className="code-block">
      <div className="code-header">
        <span>{filename}</span>
        <div className="code-tools">
          {javascript !== undefined && (
            <label>
              <span className="sr-only">Code language</span>
              <select
                value={selected}
                disabled={!ready}
                onChange={(event) => {
                  fallbackLanguage = event.target.value;
                  try {
                    localStorage.setItem(
                      'notia-code-language',
                      event.target.value,
                    );
                  } catch {
                    /* Selection works in available storage. */
                  }
                  window.dispatchEvent(new Event(change));
                  setStatus('');
                }}
              >
                <option value="ts">TypeScript</option>
                <option value="js">JavaScript</option>
              </select>
            </label>
          )}
          <button
            type="button"
            className="copy-button"
            disabled={!ready}
            onClick={copy}
            aria-label="Copy code"
          >
            <span aria-live="polite">{status || 'Copy'}</span>
            <span aria-hidden="true">{status === 'Copied' ? '✓' : '▢'}</span>
          </button>
        </div>
      </div>
      <pre tabIndex={0} aria-label={filename}>
        <code>
          <Highlight text={content} />
        </code>
      </pre>
    </div>
  );
}
