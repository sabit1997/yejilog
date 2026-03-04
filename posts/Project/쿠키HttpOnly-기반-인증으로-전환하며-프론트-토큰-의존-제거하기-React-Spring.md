---
title: 쿠키(HttpOnly) 기반 인증으로 전환하며 프론트 토큰 의존 제거하기 (React + Spring)
date: 2026-03-02 19:36:09
category: React&JS
tags:
  [
    "React",
    "Axios",
    "Auth",
    "Cookie",
    "HttpOnly",
    "Spring Security",
    "JWT",
    "OAuth",
  ]
isPrivate: false
---

# 서론

처음에는 “프론트에서 accessToken 들고 → Authorization: Bearer 주입” 구조가 익숙해서 그대로 시작했는데, 기능이 늘어나면서 점점 이런 문제가 터졌습니다.

- 프론트가 토큰 저장/주입/갱신까지 책임지면서 **인증 로직이 앱 여기저기 퍼짐**
- REST 요청이랑 SSE(알림) 연결이 섞이면서 **인증 주체가 불일치**(헤더 vs 쿠키)하는 순간이 생김
- “로그인 이력 기반으로 refresh를 부를지 말지” 같은 최적화까지 들어오니 **초기 인증 흐름이 복잡해짐**

결국 방향을 바꿨습니다.

> **토큰은 서버가 쿠키(HttpOnly)로 관리하고, 프론트는 “로그인 여부”만 관리하자.**

HttpOnly 쿠키는 JS에서 접근할 수 없어서(XSS에 대한 방어가 더 쉬움) “프론트 토큰 보관”의 부담을 확 줄일 수 있었습니다.

---

# 기존 구조가 왜 힘들었나?

## 1) accessToken을 프론트 상태(Zustand)로 들고 있었음

요청마다 인터셉터가 Authorization 헤더를 넣고, 401이면 refresh를 호출하고, 새 토큰을 다시 저장하고…
이 루프가 길어질수록 **상태/사이드이펙트 지점**이 계속 늘어납니다.

특히 SSE 같은 “별도 연결”이 들어오면 인증 흐름이 더 꼬이기 쉬워요. 그래서 “토큰 주입을 프론트에서 강제하지 않기”로 결론을 내렸습니다.

---

## 2) 초기 인증에서 refresh 호출을 “로그인 이력 키”로 제어했음

한때는 `auth-refresh-eligible` 같은 키로 “로그인 한 적이 있을 때만 refresh”를 부르도록 최적화했는데,
이게 잘만 되면 좋지만… 키가 꼬이거나 누락되면 인증 초기화 자체가 흔들립니다.

그래서 아예 “내 정보 API가 되면 로그인”이라는 단순한 판별로 바꿨습니다.

---

# 목표: 쿠키 기반 인증으로 역할 분리

| 역할             | 프론트(React)                               | 백엔드(Spring)                         |
| ---------------- | ------------------------------------------- | -------------------------------------- |
| 인증 수단        | 토큰 직접 관리 ❌                           | HttpOnly 쿠키 ✅                       |
| 로그인 여부 판단 | `/members/me` 같은 “내 정보 조회”로 확인 ✅ | accessToken 검증 ✅                    |
| 401 대응         | refresh 호출 후 원 요청 재시도 ✅           | refreshToken으로 accessToken 재발급 ✅ |
| 토큰 저장        | 안 함 ✅                                    | 쿠키로만 유지 ✅                       |

---

# 프론트 변경 (React)

## 1) AuthStore에서 `accessToken` 제거 + `isAuthResolved` 추가

이제 프론트는 토큰 자체를 모르고, 아래 상태만 관리합니다.

- `isAuthenticated`: 로그인 상태인지
- `isAuthResolved`: “초기 인증 확인이 끝났는지”

그리고 `ProtectedRoute`에서 `isAuthResolved`가 false면 아예 `null`을 리턴해서,
인증 확인 중에 라우팅이 먼저 확정되는 문제(깜빡임/잘못된 리다이렉트)를 막았습니다.

```tsx
const ProtectedRoute = () => {
  const isAuthResolved = useAuthStore((state) => state.isAuthResolved);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthResolved) return null;

  if (!isAuthenticated) {
    return <Navigate replace to="/login" />;
  }

  return <Outlet />;
};
```

---

## 2) 앱 시작 시 인증 초기화: `/auth/refresh` → `/members/me`

기존엔 refresh로 토큰을 받아 스토어에 넣었는데,
이제는 “쿠키로 인증 가능한지”만 확인하면 됩니다.

```ts
try {
  await instance.get("/members/me"); // 쿠키 기반 인증 확인
  setAuthenticated(true);

  if (
    window.location.pathname === "/login" ||
    window.location.pathname === "/"
  ) {
    router.navigate("/my-tteok", { replace: true });
  }
} catch {
  clearAuth();
} finally {
  setIsAuthInitialized(true);
}
```

이 방식은 엄청 단순해졌고, 프론트 입장에서는 “세션이 살아있으면 성공”으로 끝납니다.

---

## 3) Axios 인터셉터에서 Authorization 헤더 주입 제거

백엔드가 HttpOnly 쿠키 기반 인증을 사용하므로,
프론트에서 Authorization 헤더를 “강제로” 주입하지 않도록 정리했습니다.

```ts
instance.interceptors.request.use((config) => {
  // 백엔드가 HttpOnly 쿠키 기반 인증을 사용하므로 Authorization 헤더를 강제로 주입하지 않는다.
  // (SSE/REST 인증 주체 불일치 방지)
  return config;
});
```

쿠키를 요청에 포함시키려면 `withCredentials: true` 설정이 필요합니다. (Axios 공식 문서의 request config 옵션)

---

## 4) refresh는 “토큰 받기”가 아니라 “세션 갱신 트리거”로만 사용

401이 나면 refresh → 성공하면 원래 요청 재시도.
이때 refresh가 동시에 여러 번 호출되지 않도록 `refreshPromise`로 한 번에 묶었습니다.

```ts
let refreshPromise: null | Promise<void> = null;

if (!refreshPromise) {
  refreshPromise = axios
    .post(
      `${import.meta.env.VITE_API_BASE_URL}/refresh`,
      {},
      { withCredentials: true }
    )
    .then(() => undefined)
    .finally(() => {
      refreshPromise = null;
    });
}

await refreshPromise;
useAuthStore.getState().setAuthenticated(true);
return api(originalRequest);
```

---

# 백엔드 변경 (Spring)

## 1) accessToken을 HttpOnly 쿠키로 내려주기

로그인/refresh 응답에서 refreshToken 뿐 아니라 accessToken도 쿠키로 내려주도록 수정했습니다.
쿠키는 `Set-Cookie` 헤더로 내려가고, 여러 쿠키를 보내려면 **Set-Cookie 헤더를 여러 개** 보내는 방식이 일반적입니다.

```java
ResponseCookie refreshTokenCookie =
    ResponseCookie.from("refreshToken", refreshToken)
        .httpOnly(true)
        .secure(false) // 프로덕션에서는 true 권장
        .path("/")
        .maxAge(7 * 24 * 60 * 60)
        .sameSite("Lax")
        .build();

ResponseCookie accessTokenCookie =
    ResponseCookie.from("accessToken", accessToken)
        .httpOnly(true)
        .secure(false)
        .path("/")
        .maxAge(jwtTokenProvider.getAccessTokenValiditySeconds())
        .sameSite("Lax")
        .build();

response.addHeader(HttpHeaders.SET_COOKIE, refreshTokenCookie.toString());
response.addHeader(HttpHeaders.SET_COOKIE, accessTokenCookie.toString());
```

`ResponseCookie`는 Spring에서 쿠키 속성을 명시적으로 구성할 수 있게 해줍니다.

> 참고로 `SameSite=None`을 쓰려면 `Secure`가 필수입니다. (브라우저 정책)

---

## 2) JWT 토큰 추출: 헤더 → 없으면 쿠키에서

기존에는 Authorization 헤더만 보던 구조였다면,
이제는 쿠키에 accessToken이 들어올 수 있으니 쿠키 fallback을 추가했습니다.

```java
if (request.getCookies() != null) {
  for (Cookie cookie : request.getCookies()) {
    if ("accessToken".equals(cookie.getName())
        && StringUtils.hasText(cookie.getValue())) {
      return cookie.getValue();
    }
  }
}
```

---

## 3) 로그아웃 정비: refresh 제거 + 쿠키 만료

로그아웃이 “프론트 상태 초기화”로 끝나면 서버 쪽 토큰이 남을 수 있어서,
refresh 제거 + access/refresh 쿠키 만료까지 확실히 처리했습니다.

```java
private void expireAuthCookies(HttpServletResponse response) {
  ResponseCookie refreshTokenCookie =
      ResponseCookie.from("refreshToken", "")
          .httpOnly(true)
          .secure(false)
          .path("/")
          .maxAge(0)
          .sameSite("Lax")
          .build();

  ResponseCookie accessTokenCookie =
      ResponseCookie.from("accessToken", "")
          .httpOnly(true)
          .secure(false)
          .path("/")
          .maxAge(0)
          .sameSite("Lax")
          .build();

  response.addHeader(HttpHeaders.SET_COOKIE, refreshTokenCookie.toString());
  response.addHeader(HttpHeaders.SET_COOKIE, accessTokenCookie.toString());
}
```

---

## 4) 소셜 로그인 401 이슈: `/auth/**`는 인증 예외 처리

소셜 로그인/refresh 같은 엔드포인트는 “인증 과정 자체”라서,
여기를 JWT 필터가 막아버리면 401이 나기 쉽습니다.

그래서 SecurityConfig에서 `/auth/**`를 `permitAll()`로 열고
필터에서도 `/auth/` 경로는 검사하지 않도록 했습니다.

---

## 5) redirect-uri 환경별 설정

OAuth redirect uri는 **등록된 값과 정확히 일치**해야 해서, 환경마다 값이 바뀌는 순간 바로 에러가 납니다.
그래서 env fallback 형태로 정리했습니다.

```yml
redirect-uri: ${GOOGLE_REDIRECT_URI:http://localhost:5173/auth/google/callback}
```

---

# 쿠키 기반 인증에서 꼭 짚고 가야 하는 점

## 1) `SameSite / Secure`는 “나중에”가 아니라 “처음부터” 설계 포인트

- `Secure`는 HTTPS에서만 쿠키를 전송하게 해줍니다.
- `SameSite=None`을 쓰는 경우엔 `Secure`가 필수입니다.
- 이번 코드에는 로컬 개발 때문에 `secure(false)`가 들어가 있는데, 운영에서는 꼭 점검해야 합니다.

## 2) CSRF 관점: 쿠키 인증은 “방어를 같이” 생각해야 함

쿠키 기반 인증은 편한 대신, 브라우저가 쿠키를 자동으로 보내기 때문에 CSRF 관점이 따라옵니다.
Spring Security는 기본적으로 unsafe method(POST 등)에 CSRF 보호를 제공합니다.
또한 `SameSite`는 CSRF 완화에 도움을 주지만, 일반적으로 “보조 수단(defense-in-depth)” 성격으로 보는 게 안전합니다.

---

# 결과적으로 좋아진 점

## ✅ 프론트가 단순해짐

- accessToken 저장/주입/갱신 로직 삭제
- “로그인 여부 + 초기 확인 완료 여부”만 관리
- AuthInitializer가 `/members/me`로 단순화

## ✅ 인증 주체가 서버로 통일됨

- REST/SSE가 섞여도 “쿠키 인증”으로 한 가지 루트
- Authorization 헤더 강제 주입으로 생기던 불일치 리스크 감소

## ✅ 401 대응이 예측 가능해짐

- 401 → refresh → 재시도
- refresh 응답에서 토큰을 파싱/저장하지 않으니 사이드이펙트가 줄어듦

---

# 느낀 점

토큰을 프론트에서 들고 있던 구조는 “처음엔” 편했는데,
기능이 늘어나니까 인증이 점점 프론트의 책임이 되어버리더라고요.

이번 전환에서 제일 좋았던 건,

> 프론트가 인증의 **주체**가 아니라 **소비자**가 됐다는 점

이었습니다.
이제 프론트는 로그인 여부만 보고 UI를 그리면 되고, 인증의 책임은 서버가 가져가니까 구조가 훨씬 안정적이었습니다.

---

### 참고자료 📚

- [Set-Cookie 헤더와 SameSite/HttpOnly/Secure (MDN)](https://developer.mozilla.org/ko/docs/Web/HTTP/Reference/Headers/Set-Cookie)
- [쿠키 보안 실무 가이드 (MDN Practical implementation guide)](https://developer.mozilla.org/en-US/docs/Web/Security/Practical_implementation_guides/Cookies)
- [Axios Request Config - withCredentials (Axios Docs)](https://axios-http.com/kr/docs/req_config)
- [Spring Framework ResponseCookie API](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/http/ResponseCookie.html)
- [Spring Security - Authorize HTTP Requests](https://docs.spring.io/spring-security/reference/servlet/authorization/authorize-http-requests.html)
- [Spring Security - CSRF](https://docs.spring.io/spring-security/reference/servlet/exploits/csrf.html)
- [OWASP CSRF Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)
- [Google OAuth 2.0 Web Server Redirect URI 규칙](https://developers.google.com/identity/protocols/oauth2/web-server)
