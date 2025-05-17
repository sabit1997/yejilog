---
title: "axios.create([config])"
date: 2022-09-10 21:06:13
category: "axios"
tags: ["axios"]
isPrivate: false
---

이전에 youth-gallery 팀 프로젝트를 진행할 때 `baseURL`과 `headers`를 매번 적어주었는데

오타로 인한 오류가 발생할 수 있기 때문에 개인 프로젝트에서는 `axios.create()`를 사용하기로 결정하였다.

## **1\. axios.create**

`axios.create()`는 `Axios` 라이브러리에서 제공하는 함수로, 미리 정의된 기본 설정을 갖는 새로운 `Axios` 인스턴스를 생성하는 데 사용된다.

이 인스턴스를 사용하여 HTTP 요청을 보낼 수 있습니다. `baseURL`, `headers`, `timeout` 등을 설정할 수 있습니다.

```js
const instance = axios.create({
  baseURL: "https://some-domain.com/api/",
  headers: { "X-Custom-Header": "foobar" },
  timeout: 1000,
});
```

## **2\. 활용 예시**

우선 나는 토큰을 필요로하는 경우와 토큰을 필요로하지 않는 경우로 나눠서 작성하였다.

(혹시 다른 좋은 방법이 있다면 제안해주시면 감사하겠습니다! 😊)

client.js (토큰이 필요없는 경우)

```js
import axios from "axios";

const client = axios.create();

client.defaults.baseURL = "https://주소.co.kr";

export default client;
```

instance.js (토큰이 필요할 경우)

```js
import axios from "axios";

const client = axios.create();

client.defaults.baseURL = "https://주소.co.kr";

export default client;
```

이렇게 만들어주고 `axios`를 사용하는 파일에 가서 👇 이런 식으로 사용해주면 된다.

```jsx
import instance from "../../client/instance";

function handleButton() {
  instance
    .post("/cart/", { data })
    .then((res) => {
      console.log(res);
    })
    .catch((error) => {
      console.log(error);
    });
}
```

이렇게 설정을 해두니 오타나 실수로 인한 오류를 방지할 수 있어서 좋았다.

<br />

**참고**

[https://yamoo9.github.io/axios/guide/api.html](https://yamoo9.github.io/axios/guide/api.html)
