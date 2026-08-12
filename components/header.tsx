import Link from "next/link";
import DarkModeToggle from "@/components/DarkModeToggle";
import { SearchButton } from "@/components/search";

export default function Header() {
  return (
    <header className="site-header">
      <div className="wrap header-inner">
        <Link href="/" className="logo">
          yeji<span className="logo-accent">.log</span>
        </Link>
        <nav className="site-nav" aria-label="주요 메뉴">
          <Link href="/#posts" className="nav-link">Posts</Link>
          <Link href="/#filter" className="nav-link">Filter</Link>
          <Link href="/#projects" className="nav-link">Projects</Link>
          <Link href="/#about" className="nav-link">About</Link>
        </nav>
        <div className="header-actions">
          <SearchButton className="search-trigger" />
          <DarkModeToggle />
        </div>
      </div>
    </header>
  );
}
