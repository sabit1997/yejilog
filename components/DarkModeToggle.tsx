"use client";

import { useEffect, useState } from "react";

type ThemeMode = "auto" | "light" | "dark";

export default function DarkModeToggle() {
  const [theme, setTheme] = useState<ThemeMode>("auto");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    setTheme(saved === "light" || saved === "dark" ? saved : "auto");
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const paint = () => {
      const resolved = theme === "auto" ? (media.matches ? "dark" : "light") : theme;
      document.documentElement.setAttribute("data-theme", resolved);
      document.documentElement.setAttribute("data-theme-mode", theme);
    };
    paint();
    media.addEventListener("change", paint);
    return () => media.removeEventListener("change", paint);
  }, [hydrated, theme]);

  const choose = (next: ThemeMode) => {
    setTheme(next);
    localStorage.setItem("theme", next);
  };

  return (
    <div className="theme-control" role="group" aria-label="테마 선택">
      {(["auto", "light", "dark"] as const).map((mode) => (
        <button type="button" key={mode} className={theme === mode ? "active" : ""}
          aria-pressed={theme === mode} onClick={() => choose(mode)}>
          {mode}
        </button>
      ))}
    </div>
  );
}
