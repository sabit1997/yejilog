"use client";

import { useState } from "react";

export default function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <button
      className="code-copy-button"
      onClick={copy}
      data-copied={copied || undefined}
      type="button"
    >
      {copied ? "✓ copied" : "copy"}
    </button>
  );
}
