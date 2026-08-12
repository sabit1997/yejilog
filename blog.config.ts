const blogConfig = {
  title: `YEJILOG`,
  description: `This is a blog about knowledge sharing and study records of front-end developers.`,
  author: `YEJI`,
  introduction: `스릴러, 문학, 외계인을 좋아합니다.`,

  emoji: {
    category: `☘️`,
    tag: `👽`,
  },
  social: {
    github: `sabit1997`,
  },
  profile: {
    image: "/profile.jpg",
    email: "yeji@dev",
    stack: ["React", "Next.js", "TypeScript", "Zustand", "TanStack Query", "Spring"],
    timeline: [
      { year: "2026", text: "떠글보글 — SSE 알림, 쿠키 인증 전환" },
      { year: "2025", text: "cam-study — 캠스터디 웹/데스크탑 앱" },
      { year: "2024", text: "CI/CD 파이프라인 구축, 백엔드 배포기" },
    ],
  },
  comment: {
    utterances: "sabit1997/yejilog",
  },
  configs: {
    countOfInitialPost: 10,
  },
  projects: {
    pinned: ["cam-study", "yejilog"],
  },
} as const;

export default blogConfig;
