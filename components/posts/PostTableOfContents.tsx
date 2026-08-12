"use client";

import { useEffect, useState } from "react";
import type { TableOfContentsItem } from "@/utils/headings";

interface PostTableOfContentsProps {
  items: TableOfContentsItem[];
  variant: "desktop" | "mobile";
}

export default function PostTableOfContents({
  items,
  variant,
}: PostTableOfContentsProps) {
  const [activeId, setActiveId] = useState(items[0]?.id ?? "");

  useEffect(() => {
    const headings = items
      .map(({ id }) => document.getElementById(id))
      .filter((heading): heading is HTMLElement => heading !== null);

    if (headings.length === 0 || !("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleHeading = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];

        if (visibleHeading) setActiveId(visibleHeading.target.id);
      },
      { rootMargin: "-96px 0px -70% 0px" }
    );

    headings.forEach((heading) => observer.observe(heading));
    return () => observer.disconnect();
  }, [items]);

  if (items.length === 0) return null;

  const links = (
    <ol className="post-toc__list">
      {items.map((item) => (
        <li
          key={item.id}
          className={`post-toc__item post-toc__item--level-${item.level}`}
        >
          <a
            className="post-toc__link"
            href={`#${item.id}`}
            aria-current={activeId === item.id ? "location" : undefined}
          >
            {item.text}
          </a>
        </li>
      ))}
    </ol>
  );

  if (variant === "mobile") {
    return (
      <details className="post-toc post-toc--mobile">
        <summary className="post-toc__summary">목차</summary>
        <nav className="post-toc__nav" aria-label="글 목차">
          {links}
        </nav>
      </details>
    );
  }

  return (
    <aside className="post-toc post-toc--desktop">
      <nav className="post-toc__nav" aria-label="글 목차">
        <p className="post-toc__title">목차</p>
        {links}
      </nav>
    </aside>
  );
}
