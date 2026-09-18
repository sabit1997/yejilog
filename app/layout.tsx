import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import localFont from "next/font/local";
import Header from "@/components/header";
import blogConfig from "@/blog.config";
import { SearchProvider } from "@/components/search";

const sans = localFont({
  src: [
    { path: "./fonts/IBMPlexSansKR-Regular.woff2", weight: "400" },
    { path: "./fonts/IBMPlexSansKR-Medium.woff2", weight: "500" },
    { path: "./fonts/IBMPlexSansKR-SemiBold.woff2", weight: "600" },
  ],
  variable: "--font-ibm-sans",
  display: "swap",
});

const mono = localFont({
  src: [
    { path: "./fonts/IBMPlexMono-Regular.woff2", weight: "400" },
    { path: "./fonts/IBMPlexMono-Medium.woff2", weight: "500" },
    { path: "./fonts/IBMPlexMono-SemiBold.woff2", weight: "600" },
  ],
  variable: "--font-ibm-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://yejilog-mu.vercel.app"),
  title: blogConfig.title,
  description: blogConfig.description,
  alternates: {
    canonical: "/",
    types: {
      "application/rss+xml": [{ url: "/rss.xml", title: blogConfig.title }],
    },
  },
  openGraph: {
    type: "website",
    siteName: blogConfig.title,
    locale: "ko_KR",
    images: [{ url: "/og-default.png", width: 1200, height: 630 }],
  },
  // index/follow를 여기서 명시하면 404·에러 화면의 noindex 뒤에 그대로 따라붙어
  // 서로 충돌하는 robots 메타가 나간다. 지정하지 않는 것이 곧 index, follow다.
  robots: {
    googleBot: {
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
      const saved = stored === "light" || stored === "dark" ? stored : null;
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const isDark = saved ? saved === "dark" : prefersDark;
      document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
      document.documentElement.style.colorScheme = isDark ? "dark" : "light";
    } catch {}
  `;

  return (
    <html
      lang="ko"
      className={`${sans.variable} ${mono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
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
              {/* 모든 화면에서 전체 목록으로 갈 수 있게 둔다.
                  크롤러가 어느 글에서 시작해도 나머지 글에 닿는다. */}
              <Link href="/archive">Archive</Link>
              <a
                href={`https://github.com/${blogConfig.social.github}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub
              </a>
              <a href="/rss.xml">RSS</a>
            </div>
          </div>
          </footer>
        </SearchProvider>
      </body>
    </html>
  );
}
