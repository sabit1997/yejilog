"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Post } from "@/types/post";
import { normalizeSearchText, searchPosts } from "@/utils/search";
import styles from "./SearchProvider.module.css";

interface SearchContextValue { openSearch: () => void; closeSearch: () => void; }

type SearchItem =
  | { type: "post"; href: string; post: Post }
  | { type: "tag"; href: string; name: string; count: number };

const SearchContext = createContext<SearchContextValue | null>(null);

export function useSearch(): SearchContextValue {
  const value = useContext(SearchContext);
  if (!value) throw new Error("useSearch must be used inside SearchProvider");
  return value;
}

function Highlight({ text, query }: { text: string; query: string }) {
  const normalizedQuery = normalizeSearchText(query);
  const start = normalizeSearchText(text).indexOf(normalizedQuery);
  if (!normalizedQuery || start < 0) return text;
  const end = start + normalizedQuery.length;
  return <>{text.slice(0, start)}<mark className={styles.mark}>{text.slice(start, end)}</mark>{text.slice(end)}</>;
}

function getPreview(post: Post, query: string): string {
  const normalizedQuery = normalizeSearchText(query);
  const matchIndex = normalizeSearchText(post.searchText).indexOf(normalizedQuery);
  if (!normalizedQuery || matchIndex < 0) return post.excerpt;

  const start = Math.max(0, matchIndex - 55);
  const end = Math.min(post.searchText.length, matchIndex + normalizedQuery.length + 85);
  return `${start > 0 ? "…" : ""}${post.searchText.slice(start, end).trim()}${end < post.searchText.length ? "…" : ""}`;
}

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);

  const openSearch = useCallback(() => {
    restoreFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setIsOpen(true);
  }, []);
  const closeSearch = useCallback(() => setIsOpen(false), []);

  useEffect(() => {
    const onShortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        openSearch();
      }
    };
    window.addEventListener("keydown", onShortcut);
    return () => window.removeEventListener("keydown", onShortcut);
  }, [openSearch]);

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    requestAnimationFrame(() => inputRef.current?.focus());
    return () => {
      document.body.style.overflow = previousOverflow;
      restoreFocusRef.current?.focus();
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || posts !== null) return;
    const controller = new AbortController();
    setLoadError(false);
    fetch("/posts.json", { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error(`Unable to load search index (${response.status})`);
        return response.json() as Promise<Post[]>;
      })
      .then(setPosts)
      .catch((error: unknown) => {
        if (!(error instanceof DOMException && error.name === "AbortError")) setLoadError(true);
      });
    return () => controller.abort();
  }, [isOpen, posts]);

  const results = useMemo(() => searchPosts(posts ?? [], query), [posts, query]);
  const items = useMemo<SearchItem[]>(() => [
    ...results.posts.map((post) => ({ type: "post" as const, href: `/posts/${encodeURI(post.slug)}`, post })),
    ...results.tags.map((tag) => ({ type: "tag" as const, href: `/?tags=${encodeURIComponent(tag.name)}#posts`, ...tag })),
  ], [results]);

  useEffect(() => setActiveIndex(0), [query]);
  useEffect(() => {
    document.getElementById(`global-search-result-${activeIndex}`)?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  const navigate = useCallback((href: string) => {
    closeSearch();
    router.push(href);
  }, [closeSearch, router]);

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Escape") {
      event.preventDefault();
      closeSearch();
    } else if (event.key === "ArrowDown" && items.length) {
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % items.length);
    } else if (event.key === "ArrowUp" && items.length) {
      event.preventDefault();
      setActiveIndex((index) => (index - 1 + items.length) % items.length);
    } else if (event.key === "Enter" && items[activeIndex]) {
      event.preventDefault();
      navigate(items[activeIndex].href);
    } else if (event.key === "Tab" && dialogRef.current) {
      const focusable = [...dialogRef.current.querySelectorAll<HTMLElement>('input, button, [href], [tabindex]:not([tabindex="-1"])')];
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  };

  return (
    <SearchContext.Provider value={{ openSearch, closeSearch }}>
      {children}
      {isOpen && (
        <div className={styles.backdrop} onMouseDown={(event) => { if (event.target === event.currentTarget) closeSearch(); }}>
          <div ref={dialogRef} className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="global-search-title" onKeyDown={onKeyDown}>
            <h2 id="global-search-title" className={styles.visuallyHidden}>글과 태그 검색</h2>
            <div className={styles.searchRow}>
              <span aria-hidden="true">⌕</span>
              <input ref={inputRef} className={styles.input} type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="글 제목, 태그, 본문 검색…" aria-label="글과 태그 검색" aria-controls="global-search-results" aria-activedescendant={items[activeIndex] ? `global-search-result-${activeIndex}` : undefined} />
              <button className={styles.key} type="button" onClick={closeSearch} aria-label="검색 닫기">ESC</button>
            </div>
            <div id="global-search-results" className={styles.results} role="listbox" aria-label="Search results">
              {posts === null && !loadError && <p className={styles.status} role="status">검색 인덱스를 불러오는 중…</p>}
              {loadError && <p className={styles.empty} role="alert">검색 인덱스를 불러오지 못했습니다.</p>}
              {posts && !query.trim() && <p className={styles.empty}>제목, 카테고리, 태그와 본문을 검색할 수 있습니다.</p>}
              {posts && query.trim() && items.length === 0 && <p className={styles.empty} role="status">검색 결과가 없습니다.</p>}
              {results.posts.length > 0 && <div className={styles.groupTitle}>Posts</div>}
              {results.posts.map((post, index) => (
                <button key={post.slug} id={`global-search-result-${index}`} className={`${styles.result} ${activeIndex === index ? styles.selected : ""}`} type="button" role="option" aria-selected={activeIndex === index} onMouseEnter={() => setActiveIndex(index)} onClick={() => navigate(`/posts/${encodeURI(post.slug)}`)}>
                  <span className={styles.resultTitle}><Highlight text={post.title} query={query} /></span>
                  <span className={styles.resultMeta}><Highlight text={post.category} query={query} /> · {post.tags.map((tag, tagIndex) => <span key={tag}>{tagIndex > 0 && ", "}<Highlight text={tag} query={query} /></span>)}</span>
                  {post.excerpt && <span className={styles.excerpt}><Highlight text={getPreview(post, query)} query={query} /></span>}
                </button>
              ))}
              {results.tags.length > 0 && <div className={styles.groupTitle}>Tags</div>}
              {results.tags.map((tag, tagIndex) => {
                const index = results.posts.length + tagIndex;
                return <button key={tag.name} id={`global-search-result-${index}`} className={`${styles.result} ${activeIndex === index ? styles.selected : ""}`} type="button" role="option" aria-selected={activeIndex === index} onMouseEnter={() => setActiveIndex(index)} onClick={() => navigate(`/?tags=${encodeURIComponent(tag.name)}#posts`)}><span className={styles.resultTitle}>#<Highlight text={tag.name} query={query} /></span><span className={styles.resultMeta}>{tag.count} post{tag.count === 1 ? "" : "s"}</span></button>;
              })}
            </div>
          </div>
        </div>
      )}
    </SearchContext.Provider>
  );
}

export function SearchButton({ className = "" }: { className?: string }) {
  const { openSearch } = useSearch();
  return <button type="button" className={`${styles.trigger} ${className}`} onClick={openSearch} aria-label="검색 열기">검색 <span aria-hidden="true">⌘K</span></button>;
}
