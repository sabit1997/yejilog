---
title: Next.js에서 React Query + Axios로 SSR 적용하며 삽질한 후기
date: 2025-05-10 21:00:13
category: "Nextjs"
isPrivate: false
tags: ["Next.js", "Tanstack Query", "SSR", "Axios"]
---

## 서론

나는 직접 프로젝트를 하며 배우는 걸 선호하는 편이다. 그래서 기본 개념은 강의로만 간단히 훑고, 공식문서와 구글 검색을 병행하며 실제 코드를 짜기 시작했다.

이번에도 마찬가지였다.
"Next.js도 React와 비슷하겠지?"
라는 안일한 생각으로 시작했고, React 내에서의 `React Query + Axios` 모범사례와 Next.js + React Query 사용법을 따로 조사했다.

문제는, React 위주로만 코드를 짜고 있다는 걸 늦게 깨달았다는 점이다.

"나중에 서버사이드 렌더링으로 바꿔야지"라는 막연한 마음에 (왜 그랬는지는 나도 잘 모르겠다...)
간단하게 고쳐질 줄 알았으나... 꽤나 많은 오류를 맞이했다. 역시 먼저 구조를 잘 설계해두는게 중요하다는 걸 다시금 느낀다. 수정하면서 클라이언트와 서버 사이 제약 조건들에 꽤 고생을 했다.

`React Query`를 선택한 이유는 개인화된 GET 요청을 다루는 블로그들을 참고했고, 블로그를 찾아봤는데 개인화 된 GET 요청 , 그리고 `React Query`의 캐싱과 fetch의 캐싱의 목적이 다르기 때문에 클라이언트에서의 관리도 필요하다고 느껴서 도입했다.

`Axios`는 `interceptor` 기능을 포기할 수 없어서 도입했다.

이 글에서는 React Query + Axios로 서버사이드 렌더링(Hydration)을 적용한 흐름을 정리하려 한다.
다만, 처음엔 동작이 너무 이상했고, 공식문서 코드를 빠르게 적용해가며 겨우 "제대로 동작하는 코드"로 만든 상태다.
이후 모범 사례에 가깝도록 리펙토링 해보고자 한다.

---

## SSR 적용 대상: 창 배열 API

이 글에서 설명할 대표 API는 `창 배열`을 불러오는 API다.
`todo`, `youtube`, `camera`, `window` 등의 종류가 있으며,
**`GET /windows` API로 배열을 받아온다.**

---

## 기존 코드

### `apis/query-client.ts`

```tsx
"use client";

import { isServer, QueryClient } from "@tanstack/react-query";

let browserQueryClient: QueryClient | undefined;

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
      },
    },
  });
}

export function getQueryClient() {
  if (isServer) return makeQueryClient();
  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient();
  }
  return browserQueryClient;
}
```

공식문서 예시와 동일하므로 변경 없음.

---

### `apis/request.ts` (클라이언트 전용 Axios 래퍼)

```tsx
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";

export const client = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    Accept: "application/json, text/plain, */*",
  },
});

client.interceptors.response.use(
  (res: AxiosResponse) => res,
  async (err) => {
    const status = err.response?.status;

    if (status === 401) {
      localStorage.removeItem("ACCESS_TOKEN");
      alert("로그인이 만료되었습니다. 다시 로그인해주세요.");
      window.location.href = "/sign-in";
    }

    if (status === 403 && err.response?.data) {
      return Promise.reject(err.response.data);
    }

    return Promise.reject(err);
  }
);

const request = async (options: AxiosRequestConfig) => {
  const onSuccess = (response: AxiosResponse) => response.data;
  const onError = (error: AxiosError) =>
    Promise.reject({
      message: error.message,
      code: error.code,
      response: error.response,
    });

  return client(options).then(onSuccess).catch(onError);
};

export default request;
```

---

### `apis/services/window-services/service.ts`

```tsx
import request from "@/apis/request";
import { WindowEndpoints } from "../config";
import { WindowPatchDto } from "@/types/dto";
import { AxiosMethod } from "@/types/axios";

export default class WindowService {
  public static readonly getWindows = (): Promise<Window[]> =>
    request({ url: WindowEndpoints.getWindows(), method: AxiosMethod.GET });

  public static readonly createWindow = (
    data: Omit<Window, "id" | "userId" | "createdAt">
  ): Promise<Window> =>
    request({
      url: WindowEndpoints.createWindow(),
      method: AxiosMethod.POST,
      data,
    });

  public static readonly patchWindow = (
    id: number,
    data: WindowPatchDto
  ): Promise<Window> =>
    request({
      url: WindowEndpoints.patchWindow(id),
      method: AxiosMethod.PATCH,
      data,
    });

  public static readonly deleteWindow = (id: number): Promise<void> =>
    request({
      url: WindowEndpoints.deleteWindow(id),
      method: AxiosMethod.DELETE,
    });
}
```

---

### `apis/services/window-services/query.ts`

```tsx
import { useQuery } from "@tanstack/react-query";
import WindowService from "./service";

export const WINDOW_QUERY_KEY = ["windows"];

export const useWindows = () =>
  useQuery({
    queryKey: WINDOW_QUERY_KEY,
    queryFn: WindowService.getWindows,
    meta: {
      ERROR_SOURCE: "[창 목록 불러오기 실패]",
      SUCCESS_MESSAGE: "창 데이터를 불러왔습니다.",
    },
  });
```

이 코드들은

- [Master Data Fetching with Axios And React Query in 2024 — Part 1](https://medium.com/@cristafovici.den/master-data-fetching-with-axios-and-react-query-in-2024-part-1-7b10c5909eb1)
- [Part 2](https://medium.com/@cristafovici.den/master-data-fetching-with-axios-and-react-query-in-2024-part-2-0d0100b1b40b)

<br /> 를 보고 참고해 작성하였습니다.

---

## 개선된 SSR 코드

apis/query-client.ts 는 동일합니다. (애초에 공식문서에서 말해준 방식과 같기 때문에 고칠 필요가 없었습니다.)

apis/request.ts 를 저는 바꾸긴 했으나, 사실상 SSR 적용할 때는 크게 상관없고 따로 서버용 클라이언트를 만들었기 때문에 이것도 생략하겠습니다.

### 서버용 fetch 함수 (`apis/serverFetch.ts`)

```tsx
"use server";

import axios from "axios";
import { cookies } from "next/headers";

export const serverFetch = async (url: string) => {
  const cookieStore = cookies();
  const accessToken = cookieStore.get("AccessToken")?.value;

  const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}${url}`, {
    adapter: "fetch",
    fetchOptions: { cache: "force-cache" },
    headers: {
      Authorization: accessToken ? `Bearer ${accessToken}` : "",
    },
  });

  return res.data;
};
```

---

### 로그인 시 쿠키 저장 설정 (서버 측)

```tsx
const response = NextResponse.json({ success: true });

response.cookies.set({
  name: "AccessToken",
  value: token,
  httpOnly: true,
  path: "/",
  maxAge: 60 * 60 * 24 * 30,
  sameSite: "strict",
  secure: true,
});
```

서버측에 저장된 cookies를 가져오는 방식인데, 현재 로그인 시 저장을 하지 않기 때문에 로그인 코드도 고쳐줍니다.
클라이언트 측에서도 사용하기 때문에 기존에 브라우저에 쿠키를 저장하는 것은 수정하지 않았습니다.

---

### 서버 전용 API 래퍼 (`fetchWindows`)

```tsx
export const fetchWindows = async (): Promise<Window[]> => {
  try {
    const data = await serverFetch(WindowEndpoints.getWindows());
    return data;
  } catch (error) {
    console.error("Failed to fetch windows:", error);
    throw error;
  }
};
```

## 그리고 기존의 service 함수들 중 get 함수들은 따로 분리하여 서버용 fetch 함수로 수정해줍니다.

### `useWindows` 수정 (SSR 대응)

```tsx
export const useWindows = (enabled?: boolean) =>
  useQuery({
    queryKey: WINDOW_QUERY_KEY,
    queryFn: fetchWindows,
    enabled,
    meta: {
      ERROR_SOURCE: "[창 목록 불러오기 실패]",
      SUCCESS_MESSAGE: "창 데이터를 불러왔습니다.",
    },
  });
```

---

### `app/page.tsx`에서 `HydrationBoundary` 적용

```tsx
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import AddButton from "@/components/add-button";
import WindowZone from "@/components/window-zone";
import { fetchWindows } from "@/apis/services/window-services/service";
import { fetchTodos } from "@/apis/services/todo-services/service";
import { fetchTodayTime } from "@/apis/services/timer-services/service";
import { WINDOW_QUERY_KEY } from "@/apis/services/window-services/query";
import { TODO_QUERY_KEY } from "@/apis/services/todo-services/query";
import { TIMER_QUERY_KEY } from "@/apis/services/timer-services/query";

export const metadata = {
  title: "HOME",
  description: "Cam Study Home",
};

export default async function Home() {
  const queryClient = new QueryClient();

  const windows = await queryClient.fetchQuery({
    queryKey: WINDOW_QUERY_KEY,
    queryFn: fetchWindows,
  });

  await Promise.all([
    ...windows.map((win) =>
      queryClient.prefetchQuery({
        queryKey: [...TODO_QUERY_KEY, win.id],
        queryFn: () => fetchTodos(win.id),
      })
    ),
    queryClient.prefetchQuery({
      queryKey: TIMER_QUERY_KEY,
      queryFn: fetchTodayTime,
    }),
  ]);

  return (
    <div className="p-10">
      <div className="flex gap-10">
        <h1 className="text-7xl">HOME</h1>
        <AddButton />
      </div>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <WindowZone />
      </HydrationBoundary>
    </div>
  );
}
```

`Promise.all`을 사용한 이유는, windows 데이터를 먼저 가져온 후 해당 정보를 기반으로 각 창에 연결된 todo, timer 데이터를 병렬로 사전 로딩(`prefetch`) 하기 위함입니다.

WindowZone 컴포넌트는 `"use client"`가 선언된 클라이언트 컴포넌트이며, 내부에서 각 창에 대한 todo, timer 데이터를 사용하는데, 이를 SSR 시점에서 미리 패칭해두기 위해 상위 컴포넌트(app/page.tsx)에서 한번에 처리했습니다.

### 결과

`fetchWindows` 함수 내부에서 `console.log`를 통해 응답 데이터를 확인해본 결과, 서버 측에서 정상적으로 데이터가 렌더링되고 있음을 확인할 수 있었습니다!

![결과](/20250510.png)

## 느낀 점

- 역시 공식문서를 적극 활용해야 한다는 생각을 했다. 공식 문서만큼 정확한게 없다...
- 기술에 익숙해지지 않기! React에 익숙해져 이런 우를 범하게 되었다.
- 현재는 loading.tsx 로 로딩 중일 때 표시를 해주고 있는데 이게 맘에 들지 않아 곧 스켈레톤 UI 등으로 개선할 예정입니다. 이번에는 잘 조사해보고 해야지!

---

## 📚 참고 링크

- [Next.js에서 react-query를 왜 써? – velog](https://velog.io/@sik02/Next.js%EC%97%90%EC%84%9C-react-query%EB%A5%BC-%EC%99%9C-%EC%8D%A8)
- [Advanced Server Rendering | TanStack Query Docs](https://tanstack.com/query/latest/docs/framework/react/guides/advanced-ssr#nesting-server-components)
