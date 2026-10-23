'use client';

import { useState } from 'react';
import { useClientReady } from './ready';

export function Code({
  text,
  label = 'TypeScript / React',
}: {
  text: string;
  label?: string;
}) {
  const ready = useClientReady();
  const [status, setStatus] = useState('');
  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setStatus('Copied');
    } catch {
      setStatus('Select the text to copy');
    }
  }
  return (
    <div className="code-block">
      <div className="code-header">
        <span>{label}</span>
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
      <pre tabIndex={0} aria-label={label}>
        <code>{text}</code>
      </pre>
    </div>
  );
}
