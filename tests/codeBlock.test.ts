import assert from "node:assert/strict";
import test from "node:test";
import { getCodeBlockLanguage } from "../utils/codeBlock.ts";

test("code blocks preserve explicit languages", () => {
  assert.equal(getCodeBlockLanguage("language-tsx", "const value = 1\n"), "tsx");
});

test("bare fenced code becomes a text block while inline code stays inline", () => {
  assert.equal(getCodeBlockLanguage(undefined, "first line\nsecond line\n"), "text");
  assert.equal(getCodeBlockLanguage(undefined, "inline"), null);
});
