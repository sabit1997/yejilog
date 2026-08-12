"use client";

import { useEffect, useRef } from "react";

export default function ReadingProgress() {
  const barRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const update = () => {
      const article = document.querySelector<HTMLElement>(".prose-blog");
      if (!article || !barRef.current) return;

      const start = article.getBoundingClientRect().top + window.scrollY;
      const end = start + article.offsetHeight - window.innerHeight;
      const distance = Math.max(1, end - start);
      const progress = Math.min(100, Math.max(0, ((window.scrollY - start) / distance) * 100));
      barRef.current.style.transform = `scaleX(${progress / 100})`;
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <div className="reading-progress" aria-hidden="true">
      <span ref={barRef} />
    </div>
  );
}
