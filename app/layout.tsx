import type { Metadata } from "next";
import "./globals.css";
import { IBM_Plex_Mono, IBM_Plex_Sans_KR } from "next/font/google";
import Header from "@/components/header";
import blogConfig from "@/blog.config";
import { SearchProvider } from "@/components/search";

const sans = IBM_Plex_Sans_KR({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const mono = IBM_Plex_Mono({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://yejilog-mu.vercel.app"),
  title: blogConfig.title,
  description: blogConfig.description,
  alternates: { canonical: "/" },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const themeScript = `
    try {
      const stored = localStorage.getItem("theme");
      const saved = stored === "light" || stored === "dark" ? stored : "auto";
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const isDark = saved === "dark" || (saved === "auto" && prefersDark);
      document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
      document.documentElement.setAttribute("data-theme-mode", saved);
    } catch {}
  `;

  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body
        className={`${sans.variable} ${mono.variable}`}
      >
        <SearchProvider>
          <a className="skip-link" href="#main-content">본문으로 건너뛰기</a>
          <Header />
          {children}
          <footer className="site-footer">
          <div className="wrap footer-inner">
            <span>
              © {new Date().getFullYear()} yeji.log — built with Next.js, kombucha, and ASMR.
            </span>
            <div className="footer-links">
              <a
                href={`https://github.com/${blogConfig.social.github}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub
              </a>
              <a href="/sitemap.xml">Sitemap</a>
              <a href="/rss.xml">RSS</a>
            </div>
          </div>
          <div className="wrap footer-credits">
            <a
              href="https://www.flaticon.com/free-icons/pixel"
              title="pixel icons"
              target="_blank"
              rel="noopener noreferrer"
            >
              Pixel icons created by j8chi - Flaticon
            </a>
          </div>
          </footer>
        </SearchProvider>
      </body>
    </html>
  );
}
