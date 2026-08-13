export type UtterancesIssueTerm = "pathname" | "title";

// GitHub issue search rejects overly long queries. Preserve existing pathname
// threads for normal routes and use the shorter title for exceptional routes.
export const MAX_UTTERANCES_PATHNAME_LENGTH = 240;

export function getUtterancesIssueTerm(pathname: string): UtterancesIssueTerm {
  return pathname.length > MAX_UTTERANCES_PATHNAME_LENGTH ? "title" : "pathname";
}
