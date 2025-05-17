"use client";

import { useEffect, useRef } from "react";

export default function UtterancesComments() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    const timeout = setTimeout(() => {
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }

      const script = document.createElement("script");
      script.src = "https://utteranc.es/client.js";
      script.async = true;
      script.setAttribute("repo", "sabit1997/yejilog");
      script.setAttribute("issue-term", "pathname");
      script.setAttribute("label", "comment");
      script.setAttribute(
        "theme",
        window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "github-dark"
          : "github-light"
      );
      script.setAttribute("crossorigin", "anonymous");

      container.appendChild(script);
    }, 0);

    return () => clearTimeout(timeout);
  }, []);

  return <div ref={ref} id="comments-container" className="mt-10 relative" />;
}
