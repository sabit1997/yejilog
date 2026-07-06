"use client";

import { useEffect, useRef } from "react";

const lines = [
  "git log --oneline --author=yeji",
  'npm run build && echo "이번엔 진짜 끝"',
  "grep -r \"TODO\" ./src --color=always",
  "why-does-this-work.sh --explain",
];

export default function HeroTerminal() {
  const typedRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let li = 0;
    let ci = 0;
    let deleting = false;
    let timer: ReturnType<typeof setTimeout>;

    function tick() {
      const el = typedRef.current;
      if (!el) return;
      const cur = lines[li];

      if (!deleting) {
        ci++;
        el.textContent = cur.slice(0, ci);
        if (ci === cur.length) {
          deleting = true;
          timer = setTimeout(tick, 1500);
          return;
        }
      } else {
        ci--;
        el.textContent = cur.slice(0, ci);
        if (ci === 0) {
          deleting = false;
          li = (li + 1) % lines.length;
        }
      }

      timer = setTimeout(tick, deleting ? 22 : 52);
    }

    tick();
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="terminal">
      <div className="term-bar">
        <span className="term-dot" style={{ background: "#FF5F57" }} />
        <span className="term-dot" style={{ background: "#FEBC2E" }} />
        <span className="term-dot" style={{ background: "#28C840" }} />
        <span className="term-path">yeji@dev — ~/blog — zsh</span>
      </div>
      <div className="term-body">
        <span className="term-prompt">yeji@dev</span>
        <span className="term-cwd"> ~/blog</span>
        <span> $ </span>
        <span ref={typedRef} className="typed-cursor" />
      </div>
    </div>
  );
}
