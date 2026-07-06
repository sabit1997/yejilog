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
