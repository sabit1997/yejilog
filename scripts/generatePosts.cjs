/* eslint-disable @typescript-eslint/no-require-imports */
/* scripts/generate-posts.js */

const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");

const postsDir = path.join(process.cwd(), "posts");
const outputPath = path.join(process.cwd(), "public", "posts.json");

function markdownToPlainText(markdown) {
  return markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/~~~[\s\S]*?~~~/g, " ")
    .replace(/^ {4}.*$/gm, " ")
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/<https?:\/\/[^>]+>/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/^\s{0,3}(?:#{1,6}|>|[-+*]|\d+[.)])\s+/gm, "")
    .replace(/[*_~]+/g, "")
    .replace(/\\([\\`*{}\[\]()#+.!_>-])/g, "$1")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function createExcerpt(text, maxLength = 180) {
  if (text.length <= maxLength) return text;

  const excerpt = text.slice(0, maxLength + 1);
  const lastSpace = excerpt.lastIndexOf(" ");
  return `${excerpt.slice(0, lastSpace > maxLength * 0.6 ? lastSpace : maxLength).trim()}…`;
}

function getAllMarkdownFiles(dirPath) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  let files = [];

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      files = files.concat(getAllMarkdownFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      files.push(fullPath);
    }
  }

  return files;
}

const allMdFiles = getAllMarkdownFiles(postsDir);

const posts = allMdFiles
  .map((filePath) => {
    const slug = path
      .relative(postsDir, filePath)
      .replace(/\.md$/, "")
      .replace(/\\/g, "/");

    const raw = fs.readFileSync(filePath, "utf-8");
    const { data, content } = matter(raw);
    const searchText = markdownToPlainText(content);

    const m = raw.match(/^date:\s*(.+)$/m);
    let rawDate = m ? m[1].trim() : "";

    // 초(:ss) 제거 → "2025-05-10 21:00:13" → "2025-05-10 21:00"
    if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(rawDate)) {
      rawDate = rawDate.slice(0, 16);
    }

    return {
      slug,
      title: data.title || slug,
      date: rawDate,
      category: data.category || "",
      tags: data.tags || [],
      isPrivate: data.isPrivate || false,
      publishAt: data.publishAt || null,
      excerpt: createExcerpt(searchText),
      searchText,
    };
  })
  .filter((post) => !post.isPrivate)
  .filter((post) => {
    if (!post.publishAt) return true;
    const t = new Date(post.publishAt).getTime();
    if (Number.isNaN(t)) return true;
    return t <= Date.now();
  })
  // publishAt은 공개 검색 인덱스에 노출할 필요 없다. 필터 통과 후 제거.
  .map((post) => {
    const { publishAt: _publishAt, ...rest } = post;
    void _publishAt;
    return rest;
  });

fs.writeFileSync(outputPath, JSON.stringify(posts, null, 2), "utf-8");
module.exports = { createExcerpt, markdownToPlainText };
console.log("✅ posts.json 생성 완료");
