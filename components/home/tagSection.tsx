"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { countPostsForTag, matchesPostFilters } from "@/utils/postFilters";

interface TagSectionProps {
  posts: Array<{ category: string; tags: string[] }>;
  selectedCategory: string;
  allTags: string[];
  initialTags: string[];
}

export default function TagSection({ posts, selectedCategory, allTags, initialTags }: TagSectionProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const [pendingTags, setPendingTags] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const triggerRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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

  const closePanel = () => {
    setIsOpen(false);
    requestAnimationFrame(() => triggerRef.current?.focus());
  };

  const openPanel = () => {
    setPendingTags([...initialTags]);
    setQuery("");
    setIsOpen(true);
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closePanel();
      if (event.key === "Tab") {
        const panel = document.querySelector<HTMLElement>(".tag-panel");
        const focusable = panel?.querySelectorAll<HTMLElement>("button:not(:disabled), input");
        if (!focusable?.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

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
        <div className="tag-panel" role="dialog" aria-modal="true" aria-labelledby="tag-panel-title">
          <div className="panel-head">
            <span className="panel-title" id="tag-panel-title">태그로 필터</span>
            <div className="panel-actions">
              <button className="panel-clear" onClick={() => setPendingTags([])}>초기화</button>
              <button className="panel-close" onClick={closePanel} aria-label="태그 패널 닫기">✕</button>
            </div>
          </div>
          <label className="tag-search"><span>⌕</span><input ref={inputRef} value={query}
            onChange={(event) => setQuery(event.target.value)} placeholder="태그 검색" /></label>
          {!query && <><span className="tag-group-label">자주 쓰는 태그</span><div className="tag-cloud popular-tags">
            {popular.map((tag) => <TagButton key={tag} tag={tag} count={counts[tag]} picked={pendingTags.includes(tag)} onToggle={togglePending} />)}
          </div></>}
          <span className="tag-group-label">전체 태그 · {visibleTags.length}</span>
          <div className="tag-cloud tag-scroll">
            {visibleTags.map((tag) => <TagButton key={tag} tag={tag} count={counts[tag]} picked={pendingTags.includes(tag)} onToggle={togglePending} />)}
          </div>
          <div className="panel-footer">
            <span>{pendingTags.length}개 선택됨 · 결과 {categoryPosts.filter((post) => matchesPostFilters(post, "All", pendingTags)).length}개</span>
            <button className="panel-apply" onClick={() => { navigateWith(pendingTags); closePanel(); }}>적용하기 →</button>
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
