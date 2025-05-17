---
title: Next.js에 대해 고민을 해보자..
date: 2025-04-20 17:30:44
category: "Nextjs"
tags: ["Next.js", "Tanstack Query", "SSR", "Axios", "고민"]
isPrivate: false
---

> "SSR의 장점을 정말 느껴보고 싶다... 단순히 페이지 라우팅 구성 말고... 진짜 잘 쓰는 법이 뭘까?"

Next.js 14, 15를 사용하면서 **서버 컴포넌트와 서버사이드 렌더링(SSR)**, 그리고 **TanStack Query**를 어떻게 잘 활용할 수 있을지 고민이 깊어졌다. 검색도 많이 해보고 공식 문서도 봤지만, 여전히 머릿속이 명쾌하지는 않다.
그래도 아주 조금! 감이 오는 부분이 있어서 이렇게 정리해보려 한다.

---

## 처음엔 서버 컴포넌트 사용하기 쉬울 줄 알았다...

처음 Next.js를 접했을 땐 꽤 단순하게 느껴졌다.
서버 컴포넌트 안에서 `fetch`로 데이터를 가져오기만 하면 서버에서 렌더링까지 깔끔하게 해결되니 말이다.

```tsx
import { API_URL } from "../app/(home)/page";

async function getVideo(id: string) {
  await new Promise((resolve) => setTimeout(resolve, 10000));
  const response = await fetch(`${API_URL}/${id}/videos`);
  const json = await response.json();
  return json;
}

export default async function MovieVideo({ id }: { id: string }) {
  const movies = await getVideo(id);
  return <div>{JSON.stringify(movies)}</div>;
}
```

**"SSR로 먼저 데이터를 받고 클라이언트에서 바로 보여줄 수 있는 장점이 있고 간단하니까 얼른 써먹어 보자!"**  
이런 마음으로 내 프로젝트에도 적용하려고 했는데... 생각보다 쉽지 않았다. 우선 하다보니 Tanstack Query가 포함되면서 더욱... 어려워졌다.

---

## TanStack Query도 같이 쓰고 있는데, 같이 써도 괜찮은 걸까?

내 프로젝트는 현재 **TanStack Query 기반으로 서버 상태를 가져오고**,  
동시에 **Zustand로 로컬 상태를 관리**하는 구조를 갖고 있다.

```tsx
"use client";

import { useEffect, useState } from "react";
import { useWindowStore } from "@/stores/window-state";
import { useWindows } from "@/apis/services/window-services/query";

const WindowZone = () => {
  const isLoggedIn = typeof document !== "undefined"
    ? document.cookie.includes("AccessToken=")
    : false;

  const { data: serverWindows = [] } = useWindows(isLoggedIn);
  const localWindows = useWindowStore((state) => state.windows);
  const setWindows = useWindowStore((state) => state.setWindows);

  useEffect(() => {
    setWindows(serverWindows);
  }, [JSON.stringify(serverWindows), setWindows]);

  ...
};
```

### 여기서 고민이 시작..

서버 컴포넌트에서는 `fetch()`만 써도 SSR이 되는데,  
**TanStack Query는 결국 클라이언트에서 데이터를 가져오게 된다.**

---

## `dehydrate`와 `hydrate`를 활용하면 SSR + TanStack Query가 공존할 수 있다?

TanStack Query는 `dehydrate`와 `hydrate`라는 기능을 제공한다.  
이걸 활용하면 **서버에서 미리 데이터를 불러오고**, 클라이언트로 상태를 넘겨 **재요청 없이** 그대로 사용할 수 있다.

아직 내 프로젝트에 적용해보진 못했지만, 원리는 이렇다:

### 서버에서 캐시 생성

```tsx
import { dehydrate, QueryClient } from "@tanstack/react-query";

const queryClient = new QueryClient();

await queryClient.prefetchQuery({
  queryKey: ["windows"],
  queryFn: fetchWindows,
});

const dehydratedState = dehydrate(queryClient);
```

### 클라이언트에서 주입

```tsx
import { Hydrate } from "@tanstack/react-query";
<Hydrate state={dehydratedState}>
  <YourComponent />
</Hydrate>;
```

---

## TanStack Query SSR 사용할 때 주의할 점

- `dehydrate`는 **성공한 쿼리만 포함**됨
- `Error`, `undefined`, `mutation`은 기본 포함 X → 옵션 필요
- `shouldDehydrateQuery`, `shouldDehydrateMutation` 등을 설정해줘야 커스터마이징 가능
- **클라이언트에서 이미 존재하는 쿼리**가 있을 경우 `hydrate`는 **덮어쓰지 않음**

---

## Next.js를 SPA처럼 쓰는 것도 가능할까?

공식 문서를 보면, Next.js는 **"완전한 SPA" 방식**도 잘 지원한다.  
처음에는 모든 걸 클라이언트에서 렌더링하고, **필요에 따라 점진적으로 서버 기능을 도입하는 방식**이다.

> "처음엔 CSR 기반 SPA처럼 쓰고, 점점 Server Component나 Server Action을 추가하는 구조"

## 왜 Next.js로 SPA를 만들까?

Next.js는 단순한 CSR 프레임워크가 아니다.  
다음과 같은 기능 덕분에 SPA 방식에서도 강력한 장점을 가질 수 있다:

- **자동 코드 스플리팅**: 라우트마다 필요한 JS만 분리
- **next/link의 자동 prefetch**: 빠른 페이지 전환
- **점진적 서버 기능 도입 가능**: Server Actions, RSC 등
- **라우팅 상태를 URL에 반영**: 링크 공유/북마크에 유리

## SPA에서 점진적으로 서버 기능 도입하기

### Context + Promise + `use()` 조합으로 Suspense 사용하기

```tsx
// app/layout.tsx
import { getUser } from "./user";
import { UserProvider } from "./user-provider";

export default function RootLayout({ children }) {
  const userPromise = getUser(); // await 하지 않음

  return (
    <html lang="en">
      <body>
        <UserProvider userPromise={userPromise}>{children}</UserProvider>
      </body>
    </html>
  );
}
```

```tsx
// app/profile.tsx
"use client";

import { use } from "react";
import { useUser } from "./user-provider";

export function Profile() {
  const { userPromise } = useUser();
  const user = use(userPromise); // Suspense 걸림
  return <p>{user.name}</p>;
}
```

이 구조는 **초기 HTML 스트리밍**, **partial hydration**, **클라이언트 상태 분리**까지 가능하게 해준다.

---

## SWR이나 React Query 기반 SPA도 점진적으로 서버 기능 도입 가능

- SWR에서 `/api/user`를 key로 쓰고 fallback에 서버 데이터를 미리 주입
- React Query도 `dehydrate`, `hydrate` 구조와 동일하게 적용 가능

```tsx
// app/layout.tsx
import { SWRConfig } from "swr";
import { getUser } from "./user";

export default function RootLayout({ children }) {
  return (
    <SWRConfig value={{ fallback: { "/api/user": getUser() } }}>
      {children}
    </SWRConfig>
  );
}
```

---

## 완전 클라이언트 렌더링만 하고 싶다면?

```tsx
import dynamic from "next/dynamic";

const ClientOnlyComponent = dynamic(() => import("./component"), {
  ssr: false,
});
```

- 브라우저 API (window, document) 사용하는 컴포넌트
- 서드파티 라이브러리 등은 `ssr: false` 설정으로 처리 가능

---

## SPA에서도 URL 상태를 유지하고 싶다면?

```tsx
"use client";
import { useSearchParams } from "next/navigation";

function updateSorting(sortOrder: string) {
  const params = new URLSearchParams(searchParams.toString());
  params.set("sort", sortOrder);
  window.history.pushState(null, "", `?${params.toString()}`);
}
```

`window.history.pushState()`를 통해 SPA처럼 URL을 바꾸되, **Next.js의 라우터 상태와 연동**할 수 있다.

---

## Server Action도 점진적으로 도입 가능

```tsx
// app/actions.ts
"use server";
export async function create() {}
```

```tsx
// app/button.tsx
"use client";
import { create } from "./actions";

export function Button() {
  return <button onClick={() => create()}>Create</button>;
}
```

API route 없이도, 서버 함수 호출이 가능해진다.  
`useActionState`를 함께 쓰면 로딩/에러 관리도 깔끔하게 가능.

---

## 그래도 아직도 모르겠다..

- 모든 데이터를 **서버 컴포넌트에서 처리**하는 게 더 좋은 걸까?
- 아니면 **서버는 SSR만 담당**하고, 나머지는 `QueryClient + Hydrate` 구조가 더 나은 걸까?
- 현재 구조처럼 **TanStack Query + Zustand 로컬 상태 동기화**는 과연 효율적인 방식일까?

이 글은 아직 내 고민이 완전히 해결된 상태는 아니다.
하지만 앞으로 다시 읽으며 떠올릴 수 있도록 정리해두고자 작성했다.

---

## 📚 참고

- [TanStack Query Hydration 문서](https://tanstack.com/query/v4/docs/framework/react/reference/hydration)
- [Next.js로 SPA 만들기 공식 가이드](https://nextjs.org/docs/app/guides/single-page-applications)
