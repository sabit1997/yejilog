/* eslint-disable @typescript-eslint/no-require-imports */
/* scripts/generate-posts.js */

const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");

const postsDir = path.join(process.cwd(), "posts");
const outputPath = path.join(process.cwd(), "public", "posts.json");

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
    const { data } = matter(raw);

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
    };
  })
  .filter((post) => !post.isPrivate);

fs.writeFileSync(outputPath, JSON.stringify(posts, null, 2), "utf-8");
console.log("✅ posts.json 생성 완료");
