---
title: "React router redirect"
date: 2023-04-12 16:56:13
category: "React&JS"
tags: ["React", "Router", "redirect"]
isPrivate: false
---

## 1.개요

이번 원티드 프리온보딩 인턴십 사전과제에서 `redirect` 요구사항을 어떻게 구현할지 고민을 하게 되었습니다. 이에 대해 검색을 하다가 좋은 글을 찾아서 해답을 얻을 수 있었다!

## 2. Redirect?

사용자를 한 URL (사용자가 클릭하거나 입력한 URL)에서 다른 URL(새로운 목적지)로 보내는 것을 의미.

**Redirect가 중요한 이유:**

- 이전 URL이 더 이상 존재하지 않을 때 다른 URL로 트래픽 전달
- 이전 페이지에서 링크된 백링크가 새 페이지로 이동할 때 권한을 전달
- 404 페이지나 중복된 페이지에 대한 방문을 방지하여 전반적인 사용자 경험 개선

사전 과제에서는 `token`의 유무에 따라 `Redirect` 처리를 하라고 되어 있었다.

보통, 존재하지 않는 URL에 접근해 404페이지가 뜨는 것을 방지하거나 인증이 필요한 URL인데 인증없이 접근하거나 했을 때 사용하는 걸로 보인다.

## 3. 해결 방법

Redirect를 제대로 처리해본 경험이 없어서 검색을 해보다가 잘 설명된 블로그 글을 발견할 수 있었다. (아래 참고에 링크 첨부)

`Route`의 `element`에 `<Navigate to='/이동할 경로' />`를 주면 되는데,

나는 `token`의 유무에 따라 `element`의 값을 `< 원래 page 컴포넌트 />` 혹은 `<Navigate to='/이동할 경로' />` 줬다.

그 전에 `token` 값이 있는지 없는지를 알아보기 위한 함수를 만들었다.

`useHasToken()` 함수는 `React`의 `Context API`를 사용하여 현재 로그인한 사용자의 인증 토큰 여부를 확인한다. `useContext hook`을 사용하여 `AuthContext` 객체에서 token 값을 가져와서 해당 값이 `null`이 아닌지 확인하고, `true` 또는 `false` 값을 반환한다!

```tsx
const useHasToken = () => {
  const { token } = useContext(AuthContext);
  if (token !== null) {
    return true;
  } else {
    return false;
  }
};
```

그리고 `RedirectRoute` 함수는 `path` 를 받아와서 해당 경로에 대한 컴포넌트를 반환한다. `useHasToken` 함수를 사용하여 현재 로그인한 사용자의 인증 토큰 여부를 확인하고, `switch` 문을 사용하여 `path` 값에 따라 반환할 컴포넌트를 결정한다.

```tsx
interface TodoRouteProps {
  path: string;
}

const RedirectRoute = ({ path }: TodoRouteProps) => {
  const hasToken = useHasToken();
  switch (path) {
    case "/todo":
      return hasToken ? <Todo /> : <Navigate to="/signin" />;
    case "/signin":
      return hasToken ? <Navigate to="/todo" /> : <SignIn />;
    case "/signup":
      return hasToken ? <Navigate to="/todo" /> : <SignUp />;
    default:
      return null;
  }
};
```

마지막으로 `element` 에 `<RedirectRoute path="/todo" />`를 전달하여 해당 경로에 대한 컴포넌트를 렌더링한다. 이 부분은 원하는 경로에 맞게 수정하여 사용할 수 있다.

```tsx
element: <RedirectRoute path="/todo" />,
```

이렇게 하니 `token` 값의 여부에 따라 Redirect 처리를 할 수 있었는데, 이게 가장 좋은 방법인지는 모르습니다.

만약 더 좋은 방법이 있다면 알려주시면 감사하겠습니다. 다음에 더 좋은 방법을 찾는다면 다시 포스팅 하겠습니다. :)

📍틀린 부분이 있다면 말해주세요!

<br />

**참고**

https://www.semrush.com/blog/redirects/

https://stackabuse.com/redirects-in-react-router/
