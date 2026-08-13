"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { countPostsForTag, matchesPostFilters } from "@/utils/postFilters";
import { useSearch } from "@/components/search";

interface TagSectionProps {
  posts: Array<{ category: string; tags: string[] }>;
  selectedCategory: string;
  allTags: string[];
  initialTags: string[];
}

export default function TagSection({ posts, selectedCategory, allTags, initialTags }: TagSectionProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { activeDialog, openTagDialog, closeTagDialog } = useSearch();
  const isOpen = activeDialog === "tags";
  const [pendingTags, setPendingTags] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const triggerRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const categoryPosts = useMemo(() => posts.filter((post) =>
    matchesPostFilters(post, selectedCategory, [])
  ), [posts, selectedCategory]);

  const counts = useMemo(() => Object.fromEntries(allTags.map((tag) => {
    return [tag, countPostsForTag(posts, selectedCategory, pendingTags, tag)];
  })), [allTags, posts, selectedCategory, pendingTags]);

  const visibleTags = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase("ko");
    return allTags.filter((tag) => !needle || tag.toLocaleLowerCase("ko").includes(needle));
  }, [allTags, query]);

  const popular = [...allTags].sort((a, b) =>
    categoryPosts.filter((post) => post.tags.includes(b)).length - categoryPosts.filter((post) => post.tags.includes(a)).length
  ).slice(0, 6);
  const remainingTags = query
    ? visibleTags
    : visibleTags.filter((tag) => !popular.includes(tag));
  const resultCount = categoryPosts.filter((post) => matchesPostFilters(post, "All", pendingTags)).length;

  const closePanel = useCallback(() => {
    closeTagDialog();
    requestAnimationFrame(() => triggerRef.current?.focus());
  }, [closeTagDialog]);

  const openPanel = () => {
    setPendingTags([...initialTags]);
    setQuery("");
    openTagDialog();
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closePanel();
      if (event.key === "Tab") {
        const focusable = panelRef.current?.querySelectorAll<HTMLElement>("button:not(:disabled), input");
        if (!focusable?.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [closePanel, isOpen]);

  const togglePending = (tag: string) => setPendingTags((previous) =>
    previous.includes(tag) ? previous.filter((item) => item !== tag) : [...previous, tag]
  );

  const navigateWith = (tags: string[]) => {
    const params = new URLSearchParams(searchParams.toString());
    if (tags.length) params.set("tags", tags.join(","));
    else params.delete("tags");
    params.delete("limit");
    router.push(params.size ? `/?${params.toString()}` : "/", { scroll: false });
  };

  return (
    <>
      {isOpen && <div className="tag-panel-overlay open"
        onMouseDown={(event) => { if (event.target === event.currentTarget) closePanel(); }}>
        <div ref={panelRef} className="tag-panel" role="dialog" aria-modal="true" aria-labelledby="tag-panel-title">
          <div className="panel-head">
            <span className="panel-title" id="tag-panel-title"><b>#</b> 태그 선택 {pendingTags.length > 0 && <small>{pendingTags.length}</small>}</span>
            <div className="panel-actions">
              <button type="button" className="panel-clear" onClick={() => setPendingTags([])} disabled={pendingTags.length === 0}>초기화</button>
              <button type="button" className="panel-close" onClick={closePanel} aria-label="태그 패널 닫기">ESC</button>
            </div>
          </div>
          <div className="tag-search-section"><label className="tag-search"><span>/</span><input ref={inputRef} value={query}
            aria-label="태그 검색"
            onChange={(event) => setQuery(event.target.value)} placeholder="태그 검색 — react, 배포, css…" />
            <small>{allTags.length}개</small></label></div>
          <div className="tag-panel-body">
            {!query && <><span className="tag-group-label">자주 쓰는 태그</span><div className="tag-cloud popular-tags">
              {popular.map((tag) => <TagButton key={tag} tag={tag} count={counts[tag]} picked={pendingTags.includes(tag)} onToggle={togglePending} />)}
            </div></>}
            <span className="tag-group-label">{query ? `검색 결과 ${visibleTags.length}개` : "전체 태그"}<i>스크롤 ↓</i></span>
            <div className="tag-cloud tag-scroll">
              {remainingTags.map((tag) => <TagButton key={tag} tag={tag} count={counts[tag]} picked={pendingTags.includes(tag)} onToggle={togglePending} />)}
              {remainingTags.length === 0 && <p className="tag-no-results">일치하는 태그가 없습니다.</p>}
            </div>
          </div>
          <div className="panel-footer">
            <span>{pendingTags.length ? `${pendingTags.length}개 태그 선택됨` : "태그를 선택해 글을 좁혀보세요"}</span>
            <button type="button" className="panel-apply" onClick={() => { navigateWith(pendingTags); closePanel(); }}>{resultCount}개 글 보기 <b>↵</b></button>
          </div>
        </div>
      </div>}
      <div className="tag-row">
        <span className="tag-row-label">TAG</span>
        <div className="selected-tags">
          {initialTags.length === 0 ? <span className="tag-empty-hint">선택된 태그 없음</span> : initialTags.map((tag) => (
            <span key={tag} className="sel-tag">#{tag}<button className="sel-tag-rm"
              onClick={() => navigateWith(initialTags.filter((item) => item !== tag))} aria-label={`${tag} 태그 제거`}>✕</button></span>
          ))}
        </div>
        <button ref={triggerRef} className="tag-filter-btn" onClick={openPanel}>태그 선택
          {initialTags.length > 0 && <span className="tag-count">{initialTags.length}</span>} +</button>
      </div>
    </>
  );
}

function TagButton({ tag, count, picked, onToggle }: { tag: string; count: number; picked: boolean; onToggle: (tag: string) => void }) {
  const disabled = !picked && count === 0;
  return <button type="button" className={`tc md${picked ? " picked" : ""}`} disabled={disabled}
    aria-pressed={picked} onClick={() => onToggle(tag)}><span>#{tag}</span><small>{count}</small></button>;
}
