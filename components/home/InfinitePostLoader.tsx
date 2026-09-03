"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

interface InfinitePostLoaderProps {
  nextHref: string;
  visibleCount: number;
  totalCount: number;
}

export default function InfinitePostLoader({ nextHref, visibleCount, totalCount }: InfinitePostLoaderProps) {
  const router = useRouter();
  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadingRef.current = false;
    setIsLoading(false);
  }, [nextHref, visibleCount]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || loadingRef.current) return;
      loadingRef.current = true;
      setIsLoading(true);
      router.replace(nextHref, { scroll: false });
    }, { rootMargin: "320px 0px" });

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [nextHref, router]);

  return (
    <div ref={sentinelRef} className="infinite-loader" role="status" aria-live="polite">
      <span className="infinite-loader__prompt" aria-hidden="true">$ tail -f ./posts</span>
      <span>{isLoading ? "글 5개를 불러오는 중…" : `${visibleCount}/${totalCount} · 아래로 스크롤하면 계속 불러옵니다`}</span>
      {/* 스크롤 관측은 크롤러와 JS 없는 환경에서 동작하지 않는다.
          같은 목적지를 실제 링크로도 내보내 다음 목록에 닿게 한다. */}
      <Link href={nextHref} className="infinite-loader__more" prefetch={false}>
        다음 목록 보기
      </Link>
    </div>
  );
}
