"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

interface TagSectionProps {
  allTags: string[];
  initialTags: string[];
}

export default function TagSection({ allTags, initialTags }: TagSectionProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentTags = initialTags;

  const [isOpen, setIsOpen] = useState(false);
  const [pendingTags, setPendingTags] = useState<string[]>([]);

  const openPanel = () => {
    setPendingTags([...currentTags]);
    setIsOpen(true);
  };

  const closePanel = () => setIsOpen(false);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closePanel();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  const togglePending = (tag: string) => {
    setPendingTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const applyTags = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (pendingTags.length > 0) {
      params.set("tags", pendingTags.join(","));
    } else {
      params.delete("tags");
    }
    params.delete("limit");
    router.push(`/?${params.toString()}`, { scroll: false });
    closePanel();
  };

  const removeTag = (tag: string) => {
    const next = currentTags.filter((t) => t !== tag);
    const params = new URLSearchParams(searchParams.toString());
    if (next.length > 0) {
      params.set("tags", next.join(","));
    } else {
      params.delete("tags");
    }
    params.delete("limit");
    router.push(`/?${params.toString()}`, { scroll: false });
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={`tag-panel-overlay${isOpen ? " open" : ""}`}
        onClick={(e) => {
          if (e.target === e.currentTarget) closePanel();
        }}
      >
        <div className="tag-panel">
          <div className="panel-head">
            <span className="panel-title">태그로 필터</span>
            <div className="panel-actions">
              <button
                className="panel-clear"
                onClick={() => setPendingTags([])}
              >
                초기화
              </button>
              <button className="panel-close" onClick={closePanel}>
                ✕
              </button>
            </div>
          </div>
          <div className="tag-cloud">
            {allTags.map((tag) => (
              <button
                key={tag}
                className={`tc md${pendingTags.includes(tag) ? " picked" : ""}`}
                onClick={() => togglePending(tag)}
                aria-pressed={pendingTags.includes(tag)}
              >
                #{tag}
              </button>
            ))}
          </div>
          <button className="panel-apply" onClick={applyTags}>
            적용하기
          </button>
        </div>
      </div>

      {/* Tag row */}
      <div className="tag-row">
        <span className="tag-row-label">TAG</span>
        <div className="selected-tags">
          {currentTags.length === 0 ? (
            <span className="tag-empty-hint">선택된 태그 없음</span>
          ) : (
            currentTags.map((tag) => (
              <span key={tag} className="sel-tag">
                #{tag}
                <button
                  className="sel-tag-rm"
                  onClick={() => removeTag(tag)}
                  aria-label={`${tag} 태그 제거`}
                >
                  ✕
                </button>
              </span>
            ))
          )}
        </div>
        <button className="tag-filter-btn" onClick={openPanel}>
          태그 선택
          {currentTags.length > 0 && (
            <span className="tag-count">{currentTags.length}</span>
          )}
          +
        </button>
      </div>
    </>
  );
}
