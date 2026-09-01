import Link from "next/link";
import { SearchButton } from "@/components/search";

export default function NotFound() {
  return (
    <main className="not-found-page" id="main-content">
      {/* noindex는 Next.js가 404 응답에 직접 넣어준다. 여기서 title이나 robots를
          또 렌더하면 레이아웃 메타와 중복된 태그가 나가므로 두지 않는다. */}
      <div className="not-found-terminal">
        <div className="term-bar">
          <span className="term-dot" style={{ background: "#ff5f57" }} />
          <span className="term-dot" style={{ background: "#febc2e" }} />
          <span className="term-dot" style={{ background: "#28c840" }} />
          <span className="term-path">yeji@dev — ~/blog — zsh</span>
        </div>
        <div className="not-found-body">
          <p><span>yeji@dev</span> ~/blog $ cd ./this-page</p>
          <p className="command-error">zsh: no such file or directory: ./this-page</p>
          <p><span>yeji@dev</span> ~/blog $ <i className="terminal-cursor" /></p>
        </div>
        <div className="not-found-actions">
          <Link href="/">cd ~/blog</Link>
          <SearchButton />
        </div>
      </div>
    </main>
  );
}
