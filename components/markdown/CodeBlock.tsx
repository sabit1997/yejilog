import { codeToTokens, type BundledLanguage } from "shiki";
import CopyButton from "./CopyButton";

interface CodeBlockProps {
  language: string;
  code: string;
}

export default async function CodeBlock({ language, code }: CodeBlockProps) {
  let highlighted: Awaited<ReturnType<typeof codeToTokens>>;
  try {
    highlighted = await codeToTokens(code, {
      lang: language as BundledLanguage,
      theme: "dark-plus",
    });
  } catch {
    highlighted = await codeToTokens(code, {
      lang: "text",
      theme: "dark-plus",
    });
  }

  return (
    <div className="code-block-wrap">
      <div className="code-block-head">
        <span className="code-block-language">{language}</span>
        <CopyButton code={code} />
      </div>

      <div className="code-block-body">
        {highlighted.tokens.map((line, lineIndex) => (
          <div className="code-block-row" key={lineIndex}>
            <span className="code-line-number" aria-hidden="true">
              {lineIndex + 1}
            </span>
            <code className="code-line">
              {line.length > 0
                ? line.map((token, tokenIndex) => (
                    <span
                      key={`${lineIndex}-${tokenIndex}`}
                      style={{
                        color: token.color,
                        backgroundColor: token.bgColor,
                      }}
                    >
                      {token.content}
                    </span>
                  ))
                : "\u00a0"}
            </code>
          </div>
        ))}
      </div>
    </div>
  );
}
