"use client";

import { useEffect } from "react";

/**
 * 루트 레이아웃까지 무너진 경우의 최후 안전망.
 * Next.js 기본 화면은 <title>이 없어서 검색 결과에 "제목없음 + Application error"로
 * 색인된다. 여기서 제목과 noindex를 직접 심어 그 상황을 막는다.
 * 이 화면은 레이아웃을 대체하므로 globals.css / 폰트에 의존하지 않는다.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[yejilog] global error", {
      digest: error.digest,
      message: error.message,
    });
  }, [error]);

  return (
    <html lang="ko">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          padding: "48px 24px",
          background: "#141206",
          color: "#eeeade",
          fontFamily:
            "ui-monospace, SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace",
          fontSize: "13.5px",
          lineHeight: 1.9,
        }}
      >
        <title>일시적인 오류 — YEJILOG</title>
        <meta name="robots" content="noindex, follow" />

        <div
          data-render-error="global"
          style={{
            width: "min(100%, 520px)",
            border: "1px solid #2f2d1c",
            borderRadius: "9px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "10px 14px",
              borderBottom: "1px solid #2f2d1c",
              color: "#a5a08a",
            }}
          >
            yeji@dev — ~/blog — zsh
          </div>
          <div style={{ padding: "22px 18px" }}>
            <p style={{ margin: 0 }}>
              <span style={{ color: "#ffd64d" }}>yeji@dev</span> ~/blog $ open ./this-page
            </p>
            <p style={{ margin: 0, color: "#ff8f6b" }}>
              zsh: fatal error{error.digest ? ` (${error.digest})` : ""}
            </p>
            <p style={{ margin: 0 }}>
              페이지를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.
            </p>
          </div>
          <div
            style={{
              display: "flex",
              gap: "8px",
              padding: "14px 16px",
              borderTop: "1px solid rgba(255,255,255,.06)",
            }}
          >
            <button
              type="button"
              onClick={reset}
              style={{
                border: "1px solid #2f2d1c",
                borderRadius: "4px",
                background: "transparent",
                color: "#a5a08a",
                padding: "8px 13px",
                cursor: "pointer",
                font: "inherit",
              }}
            >
              retry
            </button>
            {/* 라우터까지 무너진 상황이므로 클라이언트 전환이 아니라
                전체 리로드로 탈출해야 한다. next/link를 쓰지 않는다. */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a
              href="/"
              style={{
                border: "1px solid #ffd64d",
                borderRadius: "4px",
                background: "#ffd64d",
                color: "#141206",
                padding: "8px 13px",
                textDecoration: "none",
              }}
            >
              cd ~/blog
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
