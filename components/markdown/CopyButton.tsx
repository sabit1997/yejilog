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
      onClick={copy}
      style={{
        fontFamily: "var(--font-jetbrains), monospace",
        fontSize: "11px",
        color: copied ? "#9FD336" : "#6e6e6e",
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: 0,
        transition: "color 0.2s",
        letterSpacing: "0.02em",
      }}
    >
      {copied ? "✓ copied" : "copy"}
    </button>
  );
}
