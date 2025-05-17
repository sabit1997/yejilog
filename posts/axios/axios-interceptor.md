---
title: "axios 커스텀 hook interceptors"
date: 2022-12-11 18:50:13
category: "axios"
tags: ["axios"]
isPrivate: false
---

## **1\. 문제 상황**

> 로그아웃 후에 다른 계정으로 로그인하면 처음에는 이전 계정의 장바구니 목록이 렌더링되고,
> 페이지를 새로 고침한 후에야 현재 계정의 장바구니 정보를 가져옴

이 문제를 해결하기 위해 useEffect나 useState를 사용하고 여러 가지 시도를 해봤지만 모두 실패했다.

이 과정에서 개발에 많은 시간을 소비했다...

혹시나 싶어서 내가 만든 axios 커스텀 hook 인 **instance**를 살펴봤다.

**instance.js**: 서버와 통신할 때 `baseURL`과 `headers`에 로그인 토큰을 설정해주는 커스텀 훅.

로그인 토큰을 로컬 스토리지에 저장했었는데, 처음에 렌더링될 때 토큰이 개발자 도구에 표시되지 않아서 문제가 `axios` 커스텀 훅에서 발생한 것 같았다.

조금씩 윤곽이 잡히는 기분으로 찾아보다가 `interceptors`라는 것을 알게 되었다!

**interceptors는 then 또는 catch로 처리되기 전에 요청과 응답을 가로챌수 있다고 한다.**

**요청을 보내기 전**에 먼저 로컬스토리지의 `token`을 `header`를 설정해주니 말끔히 해결 됐다.

## **2\. 해결 방법**

**해결 전 코드**

```jsx
import axios from "axios";

const getToken = localStorage.getItem("token");

const instance = axios.create({
  baseURL: "https://openmarket.weniv.co.kr/",
  headers: {
    Authorization: `JWT ${getToken}`,
  },
});

export default instance;
```

**해결 후 코드**

```jsx
import axios from "axios";

const instance = axios.create({
  baseURL: "https://openmarket.weniv.co.kr/",
});

instance.interceptors.request.use(function (config) {
  const getToken = localStorage.getItem("token");
  config.headers["Authorization"] = `JWT ${getToken}`;
  return config;
});

export default instance;
```

<br />

**참고**

[https://axios-http.com/kr/docs/interceptors](https://axios-http.com/kr/docs/interceptors)

[https://yamoo9.github.io/axios/guide/config-defaults.html#%EA%B8%80%EB%A1%9C%EB%B2%8C-axios-%EA%B8%B0%EB%B3%B8-defaults-%EC%84%A4%EC%A0%95](https://yamoo9.github.io/axios/guide/config-defaults.html#%EA%B8%80%EB%A1%9C%EB%B2%8C-axios-%EA%B8%B0%EB%B3%B8-defaults-%EC%84%A4%EC%A0%95)
