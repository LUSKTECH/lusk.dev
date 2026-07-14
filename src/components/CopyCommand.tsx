'use client';

import { useState } from 'react';

export default function CopyCommand({ command }: { command: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable; the command stays selectable */
    }
  };

  return (
    <div className="bo-command">
      <code>{command}</code>
      <button
        type="button"
        onClick={copy}
        className="bo-copy"
        aria-label={copied ? 'Command copied' : 'Copy command to clipboard'}
      >
        {copied ? 'Copied' : 'Copy'}
      </button>
    </div>
  );
}
