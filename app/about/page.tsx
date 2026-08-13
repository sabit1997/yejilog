import AboutSection from "@/components/home/AboutSection";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About | YEJILOG",
  description: "프론트엔드 개발자 정예지의 소개와 기술 스택입니다.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <main id="main-content" className="wrap page-main">
      <AboutSection />
    </main>
  );
}
