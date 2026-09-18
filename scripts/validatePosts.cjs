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

/**
 * frontmatter의 date/updated 값을 엄격하게 검사한다.
 * `18:06:77`처럼 JS Date가 롤오버로 조용히 받아주는 값이 실제로 있었고,
 * 그게 정렬과 sitemap lastmod를 조용히 왜곡했다.
 * gray-matter가 Date로 바꿔버리기 전의 원문을 봐야 하므로 raw에서 읽는다.
 */
function validateDateField(raw, field) {
  const matched = raw.match(new RegExp(`^${field}:\\s*(.+)$`, "m"));
  if (!matched) return field === "date" ? `\`${field}\` 필드가 없습니다` : "";

  const value = matched[1].trim().replace(/^["']|["']$/g, "");
  const parts = value.match(
    /^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2})(?::(\d{2}))?)?/
  );

  if (!parts) {
    return `\`${field}: ${value}\` — YYYY-MM-DD 또는 YYYY-MM-DD HH:MM(:SS) 형식이어야 합니다`;
  }

  const [, year, month, day, hour = "0", minute = "0", second = "0"] = parts;
  const [y, mo, d, h, mi, s] = [year, month, day, hour, minute, second].map(Number);

  if (mo < 1 || mo > 12) return `\`${field}: ${value}\` — 월이 ${mo}입니다`;
  if (d < 1 || d > 31) return `\`${field}: ${value}\` — 일이 ${d}입니다`;
  if (h > 23) return `\`${field}: ${value}\` — 시가 ${h}입니다`;
  if (mi > 59) return `\`${field}: ${value}\` — 분이 ${mi}입니다`;
  if (s > 59) return `\`${field}: ${value}\` — 초가 ${s}입니다`;

  // 2월 30일처럼 달을 넘겨버리는 날짜를 잡는다.
  const asDate = new Date(y, mo - 1, d, h, mi, s);
  if (
    asDate.getFullYear() !== y ||
    asDate.getMonth() !== mo - 1 ||
    asDate.getDate() !== d
  ) {
    return `\`${field}: ${value}\` — 존재하지 않는 날짜입니다`;
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

    for (const field of ["date", "updated", "publishAt"]) {
      const reason = validateDateField(raw, field);
      if (reason) {
        errors.push({ file: relativePath, pos: "", stage: "date", reason });
      }
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
