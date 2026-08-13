import ProjectsSection from "@/components/home/ProjectsSection";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Projects | YEJILOG",
  description: "정예지가 작업한 주요 프로젝트를 소개합니다.",
  alternates: { canonical: "/projects" },
};

export default function ProjectsPage() {
  return (
    <main id="main-content" className="wrap page-main">
      <ProjectsSection />
    </main>
  );
}
