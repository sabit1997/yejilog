/**
 * 실제 브라우저로 전 페이지를 렌더해서 클라이언트 예외를 잡는다.
 *
 * 서버 응답이 200이고 SSR HTML이 멀쩡해도, hydration이 깨지면 화면은
 * Next.js 기본 에러 화면(= <title> 없음 + "Application error")으로 바뀐다.
 * 검색 엔진은 그 화면을 색인해버리므로 curl만으로는 부족하다.
 *
 * 사용법:
 *   npm run build && npm start          # 다른 터미널에서 서버를 띄운 뒤
 *   npm run check:pages                 # 기본 http://localhost:3000
 *   npm run check:pages -- https://yejilog-mu.vercel.app
 *
 * Chrome 경로는 CHROME_PATH 환경변수로 덮어쓸 수 있다.
 */

import { execFile } from "node:child_process";
import { existsSync } from "node:fs";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const BASE_URL = (process.argv[2] ?? "http://localhost:3000").replace(/\/$/, "");
const CONCURRENCY = Number(process.env.CHECK_CONCURRENCY ?? 4);
const RENDER_BUDGET_MS = Number(process.env.CHECK_RENDER_BUDGET_MS ?? 12000);

/**
 * 렌더가 끝난 화면에 이 표식이 있으면 예외가 난 것이다.
 * 앞의 둘은 Next.js 기본 화면, 뒤의 둘은 우리 error boundary가 잡은 경우다.
 * error boundary가 화면을 대신 그려주더라도 검사는 실패로 봐야 한다.
 */
const CRASH_MARKERS = [
  "Application error",
  "a client-side exception has occurred",
  "render-error-page",
  "data-render-error",
];

/**
 * 페이지가 제대로 그려졌다는 증거. 하나라도 있으면 통과로 본다.
 * 404 화면(not-found-page)은 일부러 넣지 않는다. sitemap에 실린 URL이
 * 404로 떨어지는 것 자체가 잡아야 할 문제다.
 */
const CONTENT_MARKERS = [
  "art-h1", // 글 상세
  "home-wrap", // 홈
  "page-main", // about / projects
  "post-list", // 글 목록
];

function findChrome() {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH;

  const candidates = [
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
  ];

  return candidates.find((candidate) => existsSync(candidate)) ?? null;
}

async function collectUrls() {
  // CHECK_PATHS로 특정 경로만 짚어볼 수 있다. 예) CHECK_PATHS="/,/about"
  if (process.env.CHECK_PATHS) {
    return process.env.CHECK_PATHS.split(",")
      .map((entry) => entry.trim())
      .filter(Boolean)
      .map((pathname) => `${BASE_URL}${pathname.startsWith("/") ? "" : "/"}${pathname}`);
  }

  const response = await fetch(`${BASE_URL}/sitemap.xml`);
  if (!response.ok) {
    throw new Error(`sitemap.xml을 읽지 못했습니다 (HTTP ${response.status})`);
  }

  const xml = await response.text();
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
  if (locs.length === 0) throw new Error("sitemap.xml에 URL이 없습니다");

  // sitemap은 배포 도메인을 담고 있으므로 검사 대상 origin으로 바꿔 끼운다.
  return locs.map((loc) => {
    const { pathname } = new URL(loc);
    return `${BASE_URL}${pathname}`;
  });
}

async function renderPage(chrome, url, index) {
  const { stdout } = await execFileAsync(
    chrome,
    [
      "--headless=new",
      "--disable-gpu",
      "--no-sandbox",
      "--hide-scrollbars",
      `--virtual-time-budget=${RENDER_BUDGET_MS}`,
      `--user-data-dir=${process.env.TEMP ?? "/tmp"}/yejilog-check-${index}`,
      "--dump-dom",
      url,
    ],
    { maxBuffer: 64 * 1024 * 1024, windowsHide: true }
  );

  return stdout;
}

function judge(dom) {
  if (CRASH_MARKERS.some((marker) => dom.includes(marker))) {
    return { ok: false, reason: "클라이언트 예외 화면이 렌더됐습니다" };
  }
  if (!/<title>[^<]+<\/title>/.test(dom)) {
    return { ok: false, reason: "<title>이 비어 있습니다" };
  }
  if (!CONTENT_MARKERS.some((marker) => dom.includes(marker))) {
    return { ok: false, reason: "본문 마커를 찾지 못했습니다" };
  }
  return { ok: true };
}

async function main() {
  const chrome = findChrome();
  if (!chrome) {
    console.error("❌ Chrome을 찾지 못했습니다. CHROME_PATH를 지정해 주세요.");
    process.exit(1);
  }

  const urls = await collectUrls();
  console.log(`🔎 ${urls.length}개 페이지를 ${BASE_URL} 기준으로 렌더합니다\n`);

  const failures = [];
  let done = 0;
  let cursor = 0;

  async function worker(slot) {
    while (cursor < urls.length) {
      const index = cursor++;
      const url = urls[index];

      try {
        const status = (await fetch(url, { redirect: "manual" })).status;
        const dom = await renderPage(chrome, url, slot);
        const verdict =
          status === 200 ? judge(dom) : { ok: false, reason: `HTTP ${status}` };

        if (!verdict.ok) failures.push({ url, reason: verdict.reason });
        console.log(
          `${verdict.ok ? "  ok  " : " FAIL "} [${++done}/${urls.length}] ${decodeURIComponent(new URL(url).pathname)}`
        );
      } catch (error) {
        failures.push({ url, reason: `렌더 실패: ${error.message}` });
        console.log(` FAIL  [${++done}/${urls.length}] ${url}`);
      }
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(CONCURRENCY, urls.length) }, (_, slot) =>
      worker(slot)
    )
  );

  if (failures.length > 0) {
    console.error(`\n❌ 렌더 검사 실패 (${failures.length}/${urls.length})\n`);
    for (const failure of failures) {
      console.error(`- ${decodeURIComponent(failure.url)}`);
      console.error(`  ${failure.reason}`);
    }
    process.exit(1);
  }

  console.log(`\n✅ 렌더 검사 통과 (${urls.length} pages)`);
}

main().catch((error) => {
  console.error("❌ checkRenderedPages 실행 실패");
  console.error(error);
  process.exit(1);
});
