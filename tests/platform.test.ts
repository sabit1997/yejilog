import assert from "node:assert/strict";
import test from "node:test";
import { getSearchShortcut } from "../utils/platform.ts";

test("search shortcut follows the visitor operating system", () => {
  assert.deepEqual(getSearchShortcut("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)"), {
    ariaKeyShortcuts: "Meta+K",
    label: "⌘K",
    modifier: "meta",
  });
  assert.deepEqual(getSearchShortcut("Mozilla/5.0 (Windows NT 10.0; Win64; x64)"), {
    ariaKeyShortcuts: "Control+K",
    label: "Ctrl K",
    modifier: "control",
  });
  assert.equal(getSearchShortcut("Mozilla/5.0 (X11; Linux x86_64)").label, "Ctrl K");
});
