import assert from "node:assert/strict";
import test from "node:test";
import { extractTableOfContents } from "../utils/headings.ts";

test("TOC supports Korean and duplicates while ignoring fenced code", () => {
  const markdown = `# 문제 상황\n\n## 해결!\n\n## 해결!\n\n\`\`\`md\n# 코드 제목\n\`\`\``;
  assert.deepEqual(extractTableOfContents(markdown), [
    { id: "문제-상황", text: "문제 상황", level: 1 },
    { id: "해결", text: "해결!", level: 2 },
    { id: "해결-2", text: "해결!", level: 2 },
  ]);
});
