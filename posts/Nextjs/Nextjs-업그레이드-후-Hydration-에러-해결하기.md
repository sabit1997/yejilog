---
title: Next.js 업그레이드 후 Hydration 에러 해결하기 (localStorage, Zustand)
date: 2025-12-15 22:02:09
category: "Nextjs"
isPrivate: false
tags: ["Next.js", "React", "Hydration", "Troubleshooting", "Zustand"]
---

## 서론

Next.js 업그레이드 직후부터 콘솔에 **Hydration mismatch** 경고가 터지기 시작했고, 특히 `Navigation`, `NoticeModal`에서 자주 났다.

공식문서가 말하는 결론은 단순했다.

> 서버가 만든 HTML과 클라이언트가 처음 렌더링한 UI가 다르면 Hydration 에러가 난다.  
> ([Next.js Docs – Hydration Error](https://nextjs.org/docs/messages/react-hydration-error?utm_source=chatgpt.com))

문제는 내 코드에 “서버에서는 모르는 값(localStorage / 클라에서만 복원되는 store)”이 너무 자연스럽게 섞여 있었다는 점이다.

---

## 문제 상황

업그레이드 후 이런 류의 경고가 뜨기 시작했다.

- `Text content does not match server-rendered HTML`
- `Hydration failed because the initial UI does not match what was rendered on the server`

Next.js는 이 문제의 대표 원인으로 **브라우저 전용 API(localStorage 등), 랜덤/시간 값, 서버/클라 분기 렌더링** 등을 직접 언급한다.

React도 hydration은 “서버 렌더 결과와 클라 최초 렌더 결과가 동일해야 한다”고 못 박는다.

내 케이스는 딱 2개였다.

1. `NoticeModal`이 **localStorage 값**에 따라 “뜨냐/안 뜨냐”가 갈림
2. `Navigation`이 **Zustand store 값(username)** 에 따라 텍스트가 바뀜

---

## 원인 1) localStorage로 모달 노출 여부를 결정한 NoticeModal

내 `NoticeModal`은 대략 이런 흐름이다.

- 로컬에 숨김 처리한 공지 버전이 **현재 NOTICE_VERSION과 다르면 모달 open**
- 같으면 close

근데 서버는 localStorage를 모른다.  
서버 렌더에서는 “모달 없음”으로 HTML이 만들어지고, 클라 첫 렌더에서 localStorage를 읽고 “모달 있음”이 되면 **초기 UI가 달라져서 mismatch**가 난다.

### 해결: `useEffect` + `isClient` 가드로 “초기 UI”를 같게 만들기

Next.js 공식문서에서 제일 먼저 제시하는 해결책이 바로 이 패턴이다.  
“처음에는 서버/클라가 동일한 UI를 렌더하고, 클라이언트에서만 필요한 건 `useEffect` 이후에 처리”하는 방식.

```tsx
"use client";

import { useEffect, useState } from "react";
import { NOTICE_VERSION } from "@/constants/NOTICE_VERSION";
import {
  getHiddenNoticeVersion,
  hideCurrentNotice,
} from "@/utils/localStorage";
import { useNoticeStore } from "@/stores/useNoticeStore";

export default function NoticeModal() {
  const { isOpen, open, close } = useNoticeStore();
  const [hideChecked, setHideChecked] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);

    const hiddenVersion = getHiddenNoticeVersion(); // localStorage 접근은 여기서만
    if (hiddenVersion !== NOTICE_VERSION) open();
    else close();
  }, [open, close]);

  const handleClose = () => {
    if (hideChecked) hideCurrentNotice(NOTICE_VERSION);
    close();
  };

  // ✅ 핵심: 서버/클라 "첫 렌더" 결과를 동일하게 만들기
  if (!isClient) return null;
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl max-w-md w-full shadow-xl">
        <h2 className="text-xl font-bold mb-4">📢 공지사항</h2>
        <p>
          2025년 9월 17일(수) 이전에 가입하신 회원께서는
          <br />
          원활한 서비스 이용을 위해
          <br />
          다시 회원가입해주시기 바랍니다.
        </p>

        <label className="flex items-center mt-4">
          <input
            type="checkbox"
            checked={hideChecked}
            onChange={(e) => setHideChecked(e.target.checked)}
          />
          <span className="ml-2 text-sm">다시 보지 않기</span>
        </label>

        <div className="flex justify-end gap-2 mt-6">
          <button onClick={handleClose} className="text-blue-500">
            확인
          </button>
        </div>
      </div>
    </div>
  );
}
```

이렇게 하면 서버도 null, 클라 첫 렌더도 null → 초기 UI가 일치하고, 그 다음에만 모달이 뜬다.

---

## 원인 2) Zustand username이 첫 렌더에서 바로 반영된 Navigation

Navigation은 username이 있으면 "MY PAGE" 대신 username을 보여준다.

근데 이런 류의 값은 보통:

- 서버 렌더: 기본값(비어있음)
- 클라 렌더: persist 복원/초기화 이후 값이 존재

로 흐르기 쉽다. 즉, 서버 HTML엔 "MY PAGE", 클라 첫 렌더에선 "YEJI"가 나오면 텍스트 mismatch가 난다.

React는 hydration mismatch에서 “서버/클라가 동일한 출력을 만들도록” 조정하라고 설명한다.

### 해결: mounted 이후에만 username을 보여주기 (placeholder 전략)

```tsx
"use client";

import { usePathname } from "next/navigation";
import { IoHomeSharp, IoPaperPlane } from "react-icons/io5";
import { GoPersonFill } from "react-icons/go";
import Link from "next/link";
import { useUserStore } from "@/stores/user-state";
import TooltipWrapper from "./TooltipWrapper";
import { useEffect, useState } from "react";

const Navigation = () => {
  const pathname = usePathname();
  const username = useUserStore((state) => state.username);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const checkActive = (path: string) => {
    if (path === "/") return pathname === "/";
    return pathname === path || pathname.startsWith(`${path}/`);
  };

  return (
    <div className="flex justify-between items-center">
      <ul className="flex gap-10 px-20 py-5">
        <li>
          <Link href="/" className="cursor-pointer group">
            <IoHomeSharp
              className={`text-8xl mb-3 text-dark transition-colors ${
                checkActive("/") ? "bg-[#727D73]/50 border border-dark/50" : ""
              }`}
            />
            <p
              className={`p-0.5 border-2 rounded-md border-dark text-center font-medium ${
                checkActive("/")
                  ? "bg-dark text-[var(--text-selected)]"
                  : "bg-primary text-dark"
              }`}
            >
              HOME
            </p>
          </Link>
        </li>

        <li>
          <Link href="/my-page/record" className="cursor-pointer group">
            <GoPersonFill
              className={`text-8xl mb-3 text-dark transition-colors ${
                checkActive("/my-page")
                  ? "bg-[#727D73]/50 border border-dark/50"
                  : ""
              }`}
            />
            <p
              className={`p-0.5 border-2 rounded-md border-dark text-center font-medium ${
                checkActive("/my-page")
                  ? "bg-dark text-[var(--text-selected)]"
                  : "bg-primary text-dark"
              }`}
            >
              {mounted && username ? username : "MY PAGE"}
            </p>
          </Link>
        </li>
      </ul>

      <ul className="flex gap-5 px-4 mb-auto pt-3">
        <li>
          <TooltipWrapper content="버그 리포트 보내기">
            <a
              href="https://forms.gle/tNZ9ApZpkQptFjMp6"
              target="_blank"
              rel="noopener noreferrer"
            >
              <IoPaperPlane className="text-4xl text-dark hover:text-blue-600 transition-colors" />
            </a>
          </TooltipWrapper>
        </li>
      </ul>
    </div>
  );
};

export default Navigation;
```

포인트는 딱 이것.

- 서버 렌더: mounted=false → "MY PAGE"
- 클라 첫 렌더: mounted=false → "MY PAGE"
- hydration 이후: mounted=true → 그때 username 반영

즉, “첫 화면”을 동일하게 만들어 mismatch를 제거했다.

---

suppressHydrationWarning은 최후의 수단 (그리고 남용 금지)

나는 RootLayout에서 아래처럼 suppressHydrationWarning을 걸어뒀다.

```html
<html lang="en" suppressHydrationWarning></html>
```

이건 경고를 줄이는데 도움이 될 수 있지만, Next.js 공식문서도 정확히 필요한 경우에만 제한적으로 사용하라고 안내한다.
(Next.js Docs – suppressHydrationWarning)

그래서 내 결론은:

- 1순위: mounted/isClient로 “초기 UI 동일”을 만들기
- 2순위: 어쩔 수 없는 케이스에서만 suppressHydrationWarning

---

## (옵션) 정말 SSR이 의미 없는 컴포넌트라면: `dynamic(..., { ssr: false })`

브라우저 API에 강하게 의존하고 서버 렌더가 의미 없으면 next/dynamic로 SSR을 끄는 선택지도 있다.
(Next.js Docs – Lazy Loading / dynamic)

다만 나는 이번 케이스는 “SSR을 끌 문제”라기보다 “초기 UI를 맞출 문제”였어서 mounted/isClient로 해결했다.

---

## 느낀 점

- “클라이언트 컴포넌트니까 괜찮겠지”는 함정이었다. 초기 HTML은 서버에서 만들어질 수 있고, 그 결과와 클라 첫 렌더가 다르면 터진다.
- 공식문서가 제시하는 해결 패턴(useEffect로 클라 전용 분기)이 생각보다 정답에 가깝다.
- suppressHydrationWarning은 편하긴 한데, 습관처럼 쓰면 “문제를 덮는 코드”가 될 수도 있다.

---

### 📚 참고 링크 - Next.js Messages — Hydration Error 가이드

- [Next.js Messages — Hydration Error 가이드](https://nextjs.org/docs/messages/react-hydration-error?utm_source=chatgpt.com)

- [React Docs — hydrateRoot (hydration mismatch 원칙/주의)](https://react.dev/reference/react-dom/client/hydrateRoot?utm_source=chatgpt.com)

- [Next.js App Router — Lazy Loading 가이드](https://nextjs.org/docs/app/guides/lazy-loading)

- [Sentry Answers — Text content does not match server-rendered HTML](https://sentry.io/answers/next-js-error-text-content-does-not-match-server-rendered-html/)
