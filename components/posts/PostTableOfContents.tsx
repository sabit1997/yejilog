"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import type { TableOfContentsItem } from "@/utils/headings";

interface PostTableOfContentsProps {
  items: TableOfContentsItem[];
  variant: "desktop" | "mobile";
}

const ActiveHeadingContext = createContext("");

export function PostTableOfContentsProvider({
  items,
  children,
}: {
  items: TableOfContentsItem[];
  children: ReactNode;
}) {
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

  return <ActiveHeadingContext.Provider value={activeId}>{children}</ActiveHeadingContext.Provider>;
}

export default function PostTableOfContents({
  items,
  variant,
}: PostTableOfContentsProps) {
  const activeId = useContext(ActiveHeadingContext) || items[0]?.id || "";
  const listRef = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const list = listRef.current;
    const activeLink = list?.querySelector<HTMLElement>('[aria-current="location"]');
    if (!list || !activeLink) return;

    const listRect = list.getBoundingClientRect();
    const linkRect = activeLink.getBoundingClientRect();
    if (linkRect.top < listRect.top) {
      list.scrollTo({ top: list.scrollTop - (listRect.top - linkRect.top) - 8 });
    } else if (linkRect.bottom > listRect.bottom) {
      list.scrollTo({ top: list.scrollTop + (linkRect.bottom - listRect.bottom) + 8 });
    }
  }, [activeId]);

  if (items.length === 0) return null;

  const links = (
    <ol ref={listRef} className="post-toc__list">
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
        <p className="post-toc__title">{"//"} 목차</p>
        {links}
        <a className="post-toc__top" href="#main-content">↑ TOP</a>
      </nav>
    </aside>
  );
}
