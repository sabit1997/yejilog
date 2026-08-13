export interface SearchShortcut {
  ariaKeyShortcuts: "Meta+K" | "Control+K";
  label: "⌘K" | "Ctrl K";
  modifier: "meta" | "control";
}

const APPLE_DEVICE_PATTERN = /Macintosh|Mac OS X|iPhone|iPad|iPod/i;

export function getSearchShortcut(userAgent: string): SearchShortcut {
  return APPLE_DEVICE_PATTERN.test(userAgent)
    ? { ariaKeyShortcuts: "Meta+K", label: "⌘K", modifier: "meta" }
    : { ariaKeyShortcuts: "Control+K", label: "Ctrl K", modifier: "control" };
}
