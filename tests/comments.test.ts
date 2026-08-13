import assert from "node:assert/strict";
import test from "node:test";
import {
  getUtterancesIssueTerm,
  MAX_UTTERANCES_PATHNAME_LENGTH,
} from "../utils/comments.ts";

test("utterances preserves pathname threads for normal post routes", () => {
  assert.equal(getUtterancesIssueTerm("/posts/axios/axios-create"), "pathname");
});

test("utterances uses title before a long pathname breaks GitHub search", () => {
  const longPath = `/posts/Project/${"a".repeat(MAX_UTTERANCES_PATHNAME_LENGTH)}`;
  assert.equal(getUtterancesIssueTerm(longPath), "title");
});
