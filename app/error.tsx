"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const pathname = usePathname();
  const isPost = pathname?.startsWith("/posts/") ?? false;

  useEffect(() => {
    // 검색 엔진이 잡아간 "Application error" 화면의 원인을 추적할 수 있게 남긴다.
    console.error("[yejilog] render error", {
      digest: error.digest,
      message: error.message,
      pathname,
    });
  }, [error, pathname]);

  return (
    // render-error-page 클래스는 scripts/checkRenderedPages.mjs가 예외를 잡는 표식이다.
    <main className="not-found-page render-error-page" id="main-content">
      {/* 에러 화면이 색인되지 않도록 막는다. */}
      <meta name="robots" content="noindex, follow" />

      <div className="not-found-terminal">
        <div className="term-bar">
          <span className="term-dot" style={{ background: "#ff5f57" }} />
          <span className="term-dot" style={{ background: "#febc2e" }} />
          <span className="term-dot" style={{ background: "#28c840" }} />
          <span className="term-path">yeji@dev — ~/blog — zsh</span>
        </div>
        <div className="not-found-body">
          <p>
            <span>yeji@dev</span> ~/blog $ {isPost ? "cat ./this-post" : "open ./this-page"}
          </p>
          <p className="command-error">
            zsh: unexpected error{error.digest ? ` (${error.digest})` : ""}
          </p>
          <p>
            {isPost
              ? "글을 그리는 중에 문제가 생겼어요. 다시 시도해 보세요."
              : "화면을 그리는 중에 문제가 생겼어요. 다시 시도해 보세요."}
          </p>
          <p>
            <span>yeji@dev</span> ~/blog $ <i className="terminal-cursor" />
          </p>
        </div>
        <div className="not-found-actions">
          <button type="button" onClick={reset}>
            retry
          </button>
          <Link href="/">cd ~/blog</Link>
        </div>
      </div>
    </main>
  );
}
