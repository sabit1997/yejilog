/* eslint-disable @typescript-eslint/no-require-imports */
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
    const content = fs.readFileSync(filePath, "utf-8");
    const { data } = matter(content);

    return {
      slug,
      title: data.title || slug,
      date: data.date || "",
      category: data.category || "",
      tags: data.tags || [],
      isPrivate: data.isPrivate || false,
    };
  })
  .filter((post) => !post.isPrivate);

fs.writeFileSync(outputPath, JSON.stringify(posts, null, 2));
console.log("✅ posts.json 생성 완료");
