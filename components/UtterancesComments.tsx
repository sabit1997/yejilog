"use client";

import blogConfig from "@/blog.config";
import { useEffect, useRef } from "react";
import type { UtterancesIssueTerm } from "@/utils/comments";

export default function UtterancesComments({ issueTerm }: { issueTerm: UtterancesIssueTerm }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    const getTheme = () =>
      document.documentElement.getAttribute("data-theme") === "dark"
        ? "github-dark"
        : "github-light";

    const syncTheme = () => {
      const iframe = container.querySelector<HTMLIFrameElement>("iframe.utterances-frame");
      iframe?.contentWindow?.postMessage(
        { type: "set-theme", theme: getTheme() },
        "https://utteranc.es"
      );
    };

    const themeObserver = new MutationObserver(syncTheme);
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    const timeout = setTimeout(() => {
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }

      const script = document.createElement("script");
      script.src = "https://utteranc.es/client.js";
      script.async = true;
      script.setAttribute("repo", blogConfig.comment.utterances);
      script.setAttribute("issue-term", issueTerm);
      script.setAttribute("label", "comment");
      script.setAttribute(
        "theme",
        getTheme()
      );
      script.setAttribute("crossorigin", "anonymous");

      container.appendChild(script);
    }, 0);

    return () => {
      clearTimeout(timeout);
      themeObserver.disconnect();
    };
  }, [issueTerm]);

  return <div ref={ref} id="comments-container" className="mt-10 relative" />;
}
