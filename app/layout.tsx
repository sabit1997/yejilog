import type { Metadata } from "next";
import "./globals.css";
import { Instrument_Serif, DM_Sans, JetBrains_Mono } from "next/font/google";
import Header from "@/components/header";
import blogConfig from "@/blog.config";

const instrumentSerif = Instrument_Serif({
  weight: ["400"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-instrument",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
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
      const saved = localStorage.getItem("theme");
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const isDark = saved === "dark" || (!saved && prefersDark);
      document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
    } catch {}
  `;

  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body
        className={`${instrumentSerif.variable} ${dmSans.variable} ${jetbrainsMono.variable}`}
      >
        <Header />
        {children}
        <footer className="site-footer">
          <div className="wrap footer-inner">
            <span>
              © 2025 yeji.log — built with Next.js, kombucha, and ASMR.
            </span>
            <div className="footer-links">
              <a
                href={`https://github.com/${blogConfig.social.github}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub
              </a>
              <a href="/sitemap.xml">RSS</a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
