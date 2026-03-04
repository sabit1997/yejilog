/* eslint-disable @typescript-eslint/no-require-imports */

const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");

const postsDir = path.join(process.cwd(), "posts");

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

function formatPosition(error) {
  if (!error) return "";

  if (error.mark && typeof error.mark.line === "number") {
    return `:${error.mark.line + 1}:${error.mark.column + 1}`;
  }

  if (error.position && typeof error.position.start?.line === "number") {
    return `:${error.position.start.line}:${error.position.start.column}`;
  }

  if (typeof error.line === "number") {
    return `:${error.line}:${error.column || 1}`;
  }

  return "";
}

async function main() {
  const { compile } = await import("@mdx-js/mdx");
  const remarkGfm = (await import("remark-gfm")).default;
  const rehypeHighlight = (await import("rehype-highlight")).default;

  const allMdFiles = getAllMarkdownFiles(postsDir);
  const errors = [];

  for (const filePath of allMdFiles) {
    const relativePath = path.relative(process.cwd(), filePath);
    const raw = fs.readFileSync(filePath, "utf-8");

    let parsed;
    try {
      parsed = matter(raw);
    } catch (error) {
      errors.push({
        file: relativePath,
        pos: formatPosition(error),
        stage: "frontmatter",
        reason: error.reason || error.message,
      });
      continue;
    }

    try {
      await compile(parsed.content, {
        format: "mdx",
        remarkPlugins: [remarkGfm],
        rehypePlugins: [rehypeHighlight],
      });
    } catch (error) {
      errors.push({
        file: relativePath,
        pos: formatPosition(error),
        stage: "mdx",
        reason: error.reason || error.message,
      });
    }
  }

  if (errors.length > 0) {
    console.error(`\n❌ Posts validation failed (${errors.length})\n`);
    for (const err of errors) {
      console.error(`- ${err.file}${err.pos} [${err.stage}]`);
      console.error(`  ${err.reason}`);
    }
    process.exit(1);
  }

  console.log(`✅ Posts validation passed (${allMdFiles.length} files)`);
}

main().catch((error) => {
  console.error("❌ validatePosts script failed");
  console.error(error);
  process.exit(1);
});
