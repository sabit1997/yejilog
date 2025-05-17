import type { Metadata } from "next";
import "./globals.css";
import DarkModeToggle from "@/components/DarkModeToggle";
import localFont from "next/font/local";
import Header from "@/components/header";
import blogConfig from "@/blog.config";

const concon = localFont({
  src: "../public/concon.ttf",
  display: "swap",
  weight: "100 900",
  variable: "--font-concon",
});

const partialSans = localFont({
  src: "../public/PartialSansKR-Regular.otf",
  display: "swap",
  weight: "400",
  variable: "--font-partial",
});

const pretendard = localFont({
  src: "../public/PretendardVariable.woff2",
  display: "swap",
  weight: "100 900",
  variable: "--font-pretendard",
});

export const metadata: Metadata = {
  title: blogConfig.title,
  description: blogConfig.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${partialSans.className} ${partialSans.variable} ${concon.variable} ${concon.className} ${pretendard.className} ${pretendard.variable} antialiased dark:bg-dark-background dark:text-white bg-background text-[var(--font)] transition-colors duration-300 flex flex-col items-center `}
      >
        <section className="w-full max-w-3xl min-h-screen flex flex-col px-1">
          <Header />
          {children}
        </section>
        <DarkModeToggle />
        <footer className="text-center text-sm text-gray-500 py-6 dark:text-gray-200">
          © YEJI. <br />
          Pixel icons by
          <a
            href="https://www.flaticon.com/authors/meaicon"
            target="_blank"
            rel="noopener noreferrer"
            className="px-2"
          >
            meaicon
          </a>
          &
          <a
            href="https://www.flaticon.com/authors/j8chi"
            target="_blank"
            rel="noopener noreferrer"
            className="px-2"
          >
            j8chi
          </a>
          from
          <a
            href="https://www.flaticon.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-2"
          >
            Flaticon
          </a>
        </footer>
      </body>
    </html>
  );
}
