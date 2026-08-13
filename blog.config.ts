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
    stackGroups: [
      { title: "View", items: ["React", "TypeScript", "Next.js"] },
      { title: "State Management", items: ["Redux Toolkit", "Zustand", "TanStack Query"] },
      { title: "Code Quality Tool", items: ["ESLint", "Prettier", "Husky"] },
      { title: "Infrastructure", items: ["AWS S3", "CloudFront", "AWS EC2"] },
      { title: "Other Tools", items: ["Git", "GitHub", "Figma"] },
    ],
  },
  comment: {
    utterances: "sabit1997/yejilog",
  },
  configs: {
    countOfInitialPost: 5,
  },
  projects: {
    pinned: ["cam-study", "yejilog", "ddeugeul-bogeul", "algorithm-note"],
  },
} as const;

export default blogConfig;
