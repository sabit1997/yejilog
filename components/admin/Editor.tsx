"use client";

import { useCallback, useMemo, useRef, useState, useTransition } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { markdown } from "@codemirror/lang-markdown";
import { EditorView } from "@codemirror/view";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useRouter } from "next/navigation";

export interface EditorInitialValue {
  title: string;
  category: string;
  tags: string[];
  isPrivate: boolean;
  body: string;
  slug?: string;
  sha?: string;
  /** edit 모드일 때 원본 생성일 유지 */
  date?: string;
}

export function Editor({
  initial,
  categories,
  mode,
}: {
  initial: EditorInitialValue;
  categories: string[];
  mode: "new" | "edit";
}) {
  const router = useRouter();
  const [title, setTitle] = useState(initial.title);
  const [category, setCategory] = useState(initial.category || categories[0] || "");
  const [newCategoryMode, setNewCategoryMode] = useState(false);
  const [tagsRaw, setTagsRaw] = useState(initial.tags.join(", "));
  const [isPrivate, setIsPrivate] = useState(initial.isPrivate);
  const [body, setBody] = useState(initial.body);
  const [saving, startSaving] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(0);
  const viewRef = useRef<EditorView | null>(null);

  const tags = useMemo(
    () =>
      tagsRaw
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    [tagsRaw]
  );

  const canSave = title.trim().length > 0 && category.trim().length > 0;

  const handleSave = () => {
    setError(null);
    startSaving(async () => {
      const res = await fetch("/api/admin/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          category: category.trim(),
          tags,
          isPrivate,
          body,
          slug: initial.slug,
          sha: initial.sha,
          date: initial.date,
          mode,
        }),
      });
      if (!res.ok) {
        const msg = await res.text();
        setError(msg || `저장 실패 (${res.status})`);
        return;
      }
      router.push("/admin");
      router.refresh();
    });
  };

  const insertAtCursor = useCallback((view: EditorView, text: string) => {
    const { from, to } = view.state.selection.main;
    view.dispatch({
      changes: { from, to, insert: text },
      selection: { anchor: from + text.length },
    });
    view.focus();
  }, []);

  const uploadImage = useCallback(async (file: File): Promise<string | null> => {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    if (!res.ok) {
      setError(`이미지 업로드 실패: ${await res.text()}`);
      return null;
    }
    const data = (await res.json()) as { url: string };
    return data.url;
  }, []);

  const handleImageFiles = useCallback(
    async (view: EditorView, files: File[]) => {
      const images = files.filter((f) => f.type.startsWith("image/"));
      if (images.length === 0) return false;
      setError(null);
      setUploading((n) => n + images.length);
      try {
        for (const file of images) {
          const url = await uploadImage(file);
          if (url) {
            const alt = file.name.replace(/\.[^.]+$/, "");
            insertAtCursor(view, `\n![${alt}](${url})\n`);
          }
          setUploading((n) => Math.max(0, n - 1));
        }
      } finally {
        setUploading(0);
      }
      return true;
    },
    [insertAtCursor, uploadImage]
  );

  const extensions = useMemo(
    () => [
      markdown(),
      EditorView.domEventHandlers({
        drop(event, view) {
          const files = event.dataTransfer?.files;
          if (!files || files.length === 0) return false;
          const imgs = Array.from(files).filter((f) =>
            f.type.startsWith("image/")
          );
          if (imgs.length === 0) return false;
          event.preventDefault();
          void handleImageFiles(view, imgs);
          return true;
        },
        paste(event, view) {
          const items = event.clipboardData?.items;
          if (!items) return false;
          const files: File[] = [];
          for (const item of Array.from(items)) {
            if (item.kind === "file" && item.type.startsWith("image/")) {
              const f = item.getAsFile();
              if (f) files.push(f);
            }
          }
          if (files.length === 0) return false;
          event.preventDefault();
          void handleImageFiles(view, files);
          return true;
        },
      }),
    ],
    [handleImageFiles]
  );

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      <header className="grid grid-cols-[1fr_auto_auto] items-center gap-3 border-b border-neutral-200 bg-white/60 px-4 py-3">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="글 제목"
          className="w-full bg-transparent px-2 py-1 text-lg font-semibold outline-none placeholder:text-neutral-400"
        />
        <label className="flex items-center gap-1.5 text-xs text-neutral-600">
          <input
            type="checkbox"
            checked={isPrivate}
            onChange={(e) => setIsPrivate(e.target.checked)}
          />
          드래프트
        </label>
        <div className="flex items-center gap-2">
          {uploading > 0 && (
            <span className="text-xs text-blue-600">
              이미지 업로드 중 ({uploading})
            </span>
          )}
          {!canSave && uploading === 0 && (
            <span className="text-xs text-neutral-500">
              {title.trim() ? "카테고리 필요" : "제목 필요"}
            </span>
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={!canSave || saving || uploading > 0}
            className="rounded-md px-4 py-1.5 text-sm font-medium disabled:opacity-40"
            style={{ background: "var(--ink)", color: "var(--bg)" }}
          >
            {saving ? "저장 중..." : "저장"}
          </button>
        </div>
      </header>

      <div className="grid grid-cols-[1fr_auto_auto] items-center gap-3 border-b border-neutral-200 bg-white/40 px-4 py-2 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-500">카테고리</span>
          {mode === "edit" ? (
            <span className="rounded border border-neutral-200 bg-neutral-50 px-2 py-1 font-mono text-xs text-neutral-600">
              {category}
            </span>
          ) : newCategoryMode ? (
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="새 카테고리명"
              className="rounded border border-neutral-300 px-2 py-1 text-sm outline-none focus:border-neutral-500"
              autoFocus
            />
          ) : (
            <select
              value={category}
              onChange={(e) => {
                if (e.target.value === "__new__") {
                  setCategory("");
                  setNewCategoryMode(true);
                } else {
                  setCategory(e.target.value);
                }
              }}
              className="rounded border border-neutral-300 px-2 py-1 text-sm outline-none focus:border-neutral-500"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
              <option value="__new__">+ 새 카테고리...</option>
            </select>
          )}
          {mode === "edit" && initial.slug && (
            <span className="font-mono text-[11px] text-neutral-400">
              /{initial.slug}.md
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-500">태그</span>
          <input
            type="text"
            value={tagsRaw}
            onChange={(e) => setTagsRaw(e.target.value)}
            placeholder="React, Nextjs (쉼표 구분)"
            className="w-64 rounded border border-neutral-300 px-2 py-1 text-sm outline-none focus:border-neutral-500"
          />
        </div>
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>

      <div className="grid flex-1 grid-cols-2 gap-0 overflow-hidden">
        <div className="overflow-auto border-r border-neutral-200">
          <CodeMirror
            value={body}
            onChange={setBody}
            extensions={extensions}
            basicSetup={{ lineNumbers: false, foldGutter: false }}
            onCreateEditor={(view) => {
              viewRef.current = view;
            }}
            className="text-[13px]"
            height="100%"
          />
        </div>
        <div className="prose-blog overflow-auto px-6 py-4">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{body || "*(비어있음)*"}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
