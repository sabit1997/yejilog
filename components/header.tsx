import Link from "next/link";
import DarkModeToggle from "@/components/DarkModeToggle";

export default function Header() {
  return (
    <header className="site-header">
      <div className="wrap header-inner">
        <Link href="/" className="logo">
          yeji<span className="logo-accent">.log</span>
        </Link>
        <nav className="site-nav">
          <Link href="/#posts" className="nav-link">Posts</Link>
          <Link href="/#projects" className="nav-link">Projects</Link>
          <Link href="/#about" className="nav-link">About</Link>
        </nav>
        <DarkModeToggle />
      </div>
    </header>
  );
}
