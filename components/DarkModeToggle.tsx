"use client";

import { useEffect, useState } from "react";

export default function DarkModeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const current = document.documentElement.getAttribute("data-theme");
    setTheme(current === "dark" ? "dark" : "light");
  }, []);

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("theme", next);
    document.documentElement.setAttribute("data-theme", next);
  };

  return (
    <div className="switch-wrap">
      <button
        className="switch-plate"
        onClick={toggle}
        aria-label="테마 전환"
      >
        <div className="switch-thumb" />
      </button>
      <span className="switch-label">{theme === "dark" ? "DARK" : "LIGHT"}</span>
    </div>
  );
}
