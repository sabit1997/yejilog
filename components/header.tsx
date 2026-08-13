"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import DarkModeToggle from "@/components/DarkModeToggle";
import { SearchButton } from "@/components/search";

export default function Header() {
  const pathname = usePathname();
  const links = [
    {
      href: "/",
      label: "POSTS",
      active: pathname === "/" || pathname.startsWith("/posts/"),
    },
    { href: "/projects", label: "PROJECTS", active: pathname === "/projects" },
    { href: "/about", label: "ABOUT", active: pathname === "/about" },
  ];

  return (
    <header className="site-header">
      <div className="wrap header-inner">
        <Link href="/" className="logo">
          yeji<span className="logo-accent">.log</span>
        </Link>
        <nav className="site-nav" aria-label="주요 메뉴">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`nav-link${link.active ? " active" : ""}`}
              aria-current={link.active ? "page" : undefined}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="header-actions">
          <SearchButton className="search-trigger" />
          <DarkModeToggle />
        </div>
      </div>
    </header>
  );
}
