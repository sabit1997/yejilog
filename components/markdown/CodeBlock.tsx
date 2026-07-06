import { codeToHtml } from "shiki";
import CopyButton from "./CopyButton";

// 줄바꿈 시 continuation이 해당 줄의 첫 비공백 문자와 같은 열에서 시작하도록 함
// ::before가 absolute라서 gutter는 text flow에 영향 없음 → ch 단위로만 계산
function applyHangingIndents(html: string, code: string): string {
  const lines = code.split("\n");
  let idx = 0;
  return html.replace(/<span class="line">/g, () => {
    const line = lines[idx++] ?? "";
    let n = 0;
    for (const c of line) {
      if (c === " ") n++;
      else if (c === "\t") n += 4;
      else break;
    }
    if (n === 0) return '<span class="line">';
    return `<span class="line" style="padding-left:${n}ch;text-indent:-${n}ch;">`;
  });
}

interface CodeBlockProps {
  language: string;
  code: string;
}

export default async function CodeBlock({ language, code }: CodeBlockProps) {
  let html: string;
  try {
    html = await codeToHtml(code, {
      lang: language,
      theme: "dark-plus",
    });
  } catch {
    html = await codeToHtml(code, {
      lang: "text",
      theme: "dark-plus",
    });
  }

  html = applyHangingIndents(html, code);

  return (
    <div
      className="code-block-wrap"
      style={{
        margin: "22px 0",
        borderRadius: "var(--r)",
        overflow: "hidden",
        border: "1px solid #2a2a2a",
      }}
    >
      {/* VS Code title bar */}
      <div
        style={{
          background: "#252526",
          padding: "7px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid #1a1a1a",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-jetbrains), monospace",
            fontSize: "11px",
            color: "#858585",
            letterSpacing: "0.04em",
          }}
        >
          {language}
        </span>
        <CopyButton code={code} />
      </div>

      {/* Shiki output */}
      <div
        className="shiki-wrap"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
