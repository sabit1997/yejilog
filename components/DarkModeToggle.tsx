"use client";

import { useEffect, useState } from "react";

type ThemeMode = "light" | "dark";

export default function DarkModeToggle() {
  const [theme, setTheme] = useState<ThemeMode>("dark");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setTheme(
      saved === "light" || saved === "dark"
        ? saved
        : prefersDark
          ? "dark"
          : "light"
    );
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    document.documentElement.setAttribute("data-theme", theme);
    document.documentElement.style.colorScheme = theme;
  }, [hydrated, theme]);

  const choose = (next: ThemeMode) => {
    setTheme(next);
    localStorage.setItem("theme", next);
  };

  return (
    <button
      type="button"
      className={`theme-toggle theme-toggle--${theme}`}
      aria-label={theme === "dark" ? "라이트 모드로 전환" : "다크 모드로 전환"}
      title={theme === "dark" ? "라이트 모드로 전환" : "다크 모드로 전환"}
      onClick={() => choose(theme === "dark" ? "light" : "dark")}
    >
      <span className="theme-toggle__word">{theme.toUpperCase()}</span>
      <span className="theme-toggle__knob" aria-hidden="true">
        <span className="theme-toggle__glyph" />
      </span>
    </button>
  );
}
