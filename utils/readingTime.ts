const WORDS_PER_MINUTE = 220;

export function getReadingTime(markdown: string): number {
  const plainText = markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/!\[[^\]]*\]\([^)]+\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/[#>*_~|\-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!plainText) return 1;
  const wordCount = plainText.split(" ").filter(Boolean).length;
  const koreanCharacters = (plainText.match(/[가-힣]/g) ?? []).length;
  const weightedWords = wordCount + Math.ceil(koreanCharacters / 5);
  return Math.max(1, Math.ceil(weightedWords / WORDS_PER_MINUTE));
}
