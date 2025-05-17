---
title: Axios + Tanstack Query 사용 시 모범 사례 정리
date: 2025-04-19 23:11:14
category: "axios"
tags: ["axios", "모범사례"]
isPrivate: false
---

물론! 아래는 마크다운 문법만으로 구성된 전체 블로그 글이야. 복붙해서 바로 블로그에 사용할 수 있어.

---

# Axios + Tanstack Query 사용 시 모범 사례 정리 ✨

회사 프로젝트에서는 늘 바쁘게 시작하게 되어, 이전에 써왔던 방식만 재사용하곤 했습니다. 이번에는 개인 프로젝트를 하며 여유롭게 자료를 찾아보았고, 그 과정에서 좋은 아키텍처를 정리하게 되어 이렇게 공유합니다.

> 이 글은 **React + Tanstack Query + Axios** 조합으로 클라이언트 데이터를 관리하는 패턴을 정리한 내용입니다.

참고한 글:

- [Axios + React Query 모범 패턴 - Part 1](https://medium.com/@cristafovici.den/master-data-fetching-with-axios-and-react-query-in-2024-part-1-7b10c5909eb1)
- [Axios + React Query 모범 패턴 - Part 2](https://medium.com/@cristafovici.den/master-data-fetching-with-axios-and-react-query-in-2024-part-2-0d0100b1b40b)
- [Next.js에서 React Query 사용하기](https://velog.io/@haryan248/next-with-react-query)

---

## 1. Axios 인스턴스 구성

Axios는 인스턴스를 싱글톤으로 관리하면 설정 재사용과 유지보수에 유리합니다.

```ts
// apis/client.ts
import axios from "axios";

export const client = (() => {
  return axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    headers: {
      Accept: "application/json, text/plain, */*",
    },
  });
})();
```

---

## 2. Axios 인터셉터 설정

### ✅ 요청 인터셉터

매 요청마다 쿠키에서 `AccessToken`을 읽어 자동으로 Authorization 헤더에 추가합니다.

```ts
client.interceptors.request.use(
  (config) => {
    const getAccessTokenFromCookie = () => {
      const match = document.cookie.match(/(^| )AccessToken=([^;]+)/);
      return match ? match[2] : null;
    };

    const token = getAccessTokenFromCookie();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);
```

### 응답 인터셉터

401 응답 시 쿠키 삭제 후 로그인 페이지로 이동, 403은 에러 데이터를 그대로 반환합니다.

```ts
client.interceptors.response.use(
  (res) => res,
  async (err) => {
    const status = err.response?.status;

    if (status === 401) {
      document.cookie = "AccessToken=; path=/; max-age=0";
      alert("로그인이 만료되었습니다. 다시 로그인해주세요.");
      window.location.href = "/sign-in";
      return Promise.reject(err);
    }

    if (status === 403 && err.response?.data) {
      return Promise.reject(err.response.data);
    }

    return Promise.reject(err);
  }
);
```

---

## 3. API 추상화: endpoint와 서비스 분리

### Endpoint 선언

```ts
// apis/endpoints/window.ts
export const WindowEndpoints = {
  getWindows: () => "/windows",
  createWindow: () => "/windows",
  patchWindow: (id: number) => `/windows/${id}`,
  deleteWindow: (id: number) => `/windows/${id}`,
};
```

### 서비스 클래스

```ts
// apis/services/windowService.ts
import request from "../request";
import { WindowEndpoints } from "../endpoints/window";

export default class WindowService {
  static getWindows() {
    return request({ url: WindowEndpoints.getWindows(), method: "GET" });
  }

  static createWindow(data: any) {
    return request({
      url: WindowEndpoints.createWindow(),
      method: "POST",
      data,
    });
  }

  static patchWindow(id: number, data: any) {
    return request({
      url: WindowEndpoints.patchWindow(id),
      method: "PATCH",
      data,
    });
  }

  static deleteWindow(id: number) {
    return request({ url: WindowEndpoints.deleteWindow(id), method: "DELETE" });
  }
}
```

> `request.ts`는 `client`를 wrapping한 함수로, 응답 전처리 등을 한곳에서 관리할 수 있도록 도와줍니다.

---

## 4. Tanstack Query 설정

```ts
// apis/query-client.ts
import { QueryClient } from "@tanstack/react-query";

let browserQueryClient: QueryClient;

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        retry: 1,
      },
    },
  });
}

export function getQueryClient() {
  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient();
  }
  return browserQueryClient;
}
```

### QueryClientProvider

```tsx
// app/providers.tsx
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { getQueryClient } from "@/apis/query-client";

export function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

---

## 5. useQuery / useMutation 구조화

### useQuery 예시

```ts
// apis/hooks/useWindows.ts
import { useQuery } from "@tanstack/react-query";
import WindowService from "../services/windowService";

const WINDOW_QUERY_KEY = ["windows"];

export const useWindows = () => {
  return useQuery({
    queryKey: WINDOW_QUERY_KEY,
    queryFn: WindowService.getWindows,
    meta: {
      ERROR_SOURCE: "[창 목록 불러오기 실패]",
      SUCCESS_MESSAGE: "창 데이터를 불러왔습니다.",
    },
  });
};
```

### useMutation 예시

```ts
// apis/hooks/useCreateWindow.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import WindowService from "../services/windowService";

const WINDOW_QUERY_KEY = ["windows"];

export const useCreateWindow = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: WindowService.createWindow,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: WINDOW_QUERY_KEY }),
    meta: {
      SUCCESS_MESSAGE: "창이 생성되었습니다.",
      ERROR_SOURCE: "[창 생성 실패]",
    },
  });
};
```

---

## 왜 이 구조가 좋은가?

- **일관성**: 모든 요청 흐름이 비슷한 패턴으로 유지되어 가독성과 유지보수에 유리합니다.
- **분리된 관심사**: 컴포넌트는 UI만, 서비스는 데이터만 담당하게 분리됩니다.
- **테스트 용이성**: 서비스 레이어 단독 테스트 가능.
- **오류 추적 용이**: `meta.ERROR_SOURCE`로 문제 발생 위치 추적이 쉬워집니다.
- **React Query의 이점**: 자동 캐싱, 오류 처리, re-fetching, Devtools 활용 가능.

## 마무리

사실 클래스를 많이 사용해본 적이 없는데 모범 사례 관련해서 검색할 때 클래스를 활용한 해결방법이 많이 나오던데 클래스에 대한 공부를 더욱 해야할 것 같다. 사실 이 모범 사례를 100% 활용한 것 같지는 않다. 계속 프로젝트를 유지보수하면서 수정해나가고 활용해볼텐데 또 느낀 점이 생긴다면 또 글을 작성하도록 하겠습니다. 읽어주셔서 감사합니다!
