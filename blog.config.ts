const blogConfig = {
  title: `YEJILOG`,
  description: `This is a blog about knowledge sharing and study records of front-end developers.`,
  author: `YEJI`,
  introduction: `내가 모르는게 너무 많아서 작성하기 시작한 블로그 \n 미래의 나를 위한 소중한 자산이 되어주길...`,

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
} as const;

export default blogConfig;
