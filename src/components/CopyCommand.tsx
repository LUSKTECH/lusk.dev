'use client';

import { useEffect, useRef, useState } from 'react';

export default function CopyCommand({ command }: { command: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clear the reset timer on unmount so we never call setState on a gone component.
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      /* clipboard unavailable; the command stays selectable */
    }
  };

  return (
    <div className="bo-command">
      <code>{command}</code>
      <button
        type="button"
        onClick={() => {
          void copy();
        }}
        className="bo-copy"
        aria-label={copied ? 'Command copied' : 'Copy command to clipboard'}
      >
        {copied ? 'Copied' : 'Copy'}
      </button>
    </div>
  );
}
