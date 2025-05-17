#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */

const fs = require("fs");
const path = require("path");
const readline = require("readline");
const dayjs = require("dayjs");

const POSTS_DIR = path.join(__dirname, "../posts");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function questionAsync(question) {
  return new Promise((resolve) => rl.question(question, resolve));
}

function getCategories() {
  if (!fs.existsSync(POSTS_DIR)) return [];
  return fs
    .readdirSync(POSTS_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((dir) => dir.name);
}

function toSafeSlug(text) {
  return text
    .trim()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-");
}

async function main() {
  const categories = getCategories();

  console.log("\n[🗂  카테고리 선택]");
  categories.forEach((cat, i) => console.log(`${i + 1}. ${cat}`));
  console.log(`${categories.length + 1}. [새 카테고리 만들기]`);

  const catChoice = await questionAsync("번호를 선택하세요: ");

  let category;
  if (parseInt(catChoice) === categories.length + 1) {
    category = await questionAsync("새 카테고리명을 입력하세요: ");
  } else {
    category = categories[parseInt(catChoice) - 1];
  }

  const rawTitle = await questionAsync("\n📝 글 제목을 입력하세요: ");
  const title = rawTitle.trim();
  const slug = toSafeSlug(title);
  const date = dayjs().format("YYYY-MM-DD HH:mm:ss");

  const postDir = path.join(POSTS_DIR, category);
  if (!fs.existsSync(postDir)) fs.mkdirSync(postDir);

  const filePath = path.join(postDir, `${slug}.md`);
  const frontMatter = `---\ntitle: "${title}"\ndate: ${date}\ncategory: "${category}"\ntags: []\nisPrivate: false\n---\n\n`;

  fs.writeFileSync(filePath, frontMatter);
  console.log(`\n✅ 새 글이 생성되었습니다: ${filePath}`);

  rl.close();
}

main();
