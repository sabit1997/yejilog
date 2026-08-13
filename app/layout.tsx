import type { Metadata } from "next";
import "./globals.css";
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
