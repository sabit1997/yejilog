import assert from "node:assert/strict";
import test from "node:test";
import { getReadingTime } from "../utils/readingTime.ts";

test("returns at least one minute for empty and short posts", () => {
  assert.equal(getReadingTime(""), 1);
  assert.equal(getReadingTime("짧은 글입니다."), 1);
});

test("ignores fenced code blocks when estimating reading time", () => {
  const prose = Array.from({ length: 230 }, () => "word").join(" ");
  const code = `\n\`\`\`js\n${Array.from({ length: 500 }, () => "const value = 1;").join("\n")}\n\`\`\``;
  assert.equal(getReadingTime(prose), 2);
  assert.equal(getReadingTime(`${prose}${code}`), 2);
});
