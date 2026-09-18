import assert from "node:assert/strict";
import test from "node:test";
import { isScheduledForFuture } from "../utils/posts.ts";

test("no publishAt = 즉시 공개", () => {
  assert.equal(isScheduledForFuture(undefined), false);
  assert.equal(isScheduledForFuture(""), false);
  assert.equal(isScheduledForFuture(null), false);
});

test("과거 시각은 이미 공개된 것으로 본다", () => {
  assert.equal(isScheduledForFuture("2000-01-01 00:00:00"), false);
  assert.equal(isScheduledForFuture(new Date("2000-01-01")), false);
});

test("미래 시각은 아직 공개 안 함", () => {
  const future = new Date(Date.now() + 60_000).toISOString();
  assert.equal(isScheduledForFuture(future), true);
});

test("잘못된 값은 안전하게 무시 (즉시 공개로 처리)", () => {
  assert.equal(isScheduledForFuture("not-a-date"), false);
  assert.equal(isScheduledForFuture({}), false);
});
