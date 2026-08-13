export function getCodeBlockLanguage(
  className: string | undefined,
  code: string
): string | null {
  const language = /language-([\w-]+)/.exec(className ?? "")?.[1];
  if (language) return language;

  // Fenced code without an explicit language keeps a trailing newline.
  // Inline code does not, so it remains an inline <code> element.
  return code.includes("\n") ? "text" : null;
}
