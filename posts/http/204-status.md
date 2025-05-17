---
title: "204 status"
date: 2022-10-14 23:09:13
category: "http"
tags: ["http", "204", "status"]
isPrivate: false
---

## **1\. 문제 상황**

`axios.delete`로 서버와 통신이 성공했는데 화면에서 바로 적용이 되지 않는 현상을 발견했다.

이 때 status를 살펴보니 `204 status`였다.

**204 status는 어떤 상태를 말하는걸까?**

> 204 No Content

서버가 요청을 성공적으로 수행하였으며 **응답 콘텐츠에 보낼 추가 콘텐츠가 없음**을 나타낸다.

`PUT`, `PATCH`에 응답할 때 서버가 대체/업데이트된 리소스를 반환하거나, `DELETE`에 응답할 때 일반적으로 삭제 후 반환할 것이 없기 때문에 사용된다고 하였다.

**아, 삭제 후에 반환할 것이 없어서 204 status가 떴구나 이해할 수 있었다.**

사실 `PUT`과 `PATCH`를 사용했을 때 `204` 때문에 문제를 겪은 적이 없어 그냥 지나간 것이 아닌가 싶다.

내가 주로 사용했던 상황은 수정 페이지(상품 수정 등)에서 수정을 하고 난 뒤 페이지를 이동했기 때문에

그 페이지에서 다시 `GET`요청을 실행해 컨텐츠를 불러왔기 때문이다.

하지만 이번에 `DELETE`요청을 보내는

![image](https://github-production-user-asset-6210df.s3.amazonaws.com/100986977/237414024-6f4ae3a9-970d-4e51-a021-eb8f2675269a.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAVCODYLSA53PQK4ZA%2F20250516%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20250516T133013Z&X-Amz-Expires=300&X-Amz-Signature=6d844f0f75c5445338e5fedad206c92d38b3e232f66836f541d77dc1c06e6a5c&X-Amz-SignedHeaders=host)

데이터를 불러오는 페이지에서 삭제 또한 하기 때문에 `204 status`에 생각해 볼 수 있게 되었다.

새로 고침을 하면 제대로 삭제된 상태가 반영이 되었으나 내가 원하는 건 그게 아니었으니까!

## **2\. 해결 방법**

```jsx
// 상품 삭제
function deleteProduct() {
  instance
    .delete(`/cart/${cartItemId}/`)
    .then((res) => {
      if (res.status === 204) {
        setCartData(
          cartData.filter((item) => item.cart_item_id !== cartItemId)
        );
      }
      setDeleteModal(false);
    })
    .catch((error) => console.log(error));
}
```

그래서 `204 status`일 때 상품 데이터를 저장하는 `useState`에 삭제한 상품을 제외한 상품들을 저장해줘 해결했다.

**(+ 그냥 추가적으로 궁금해서 정리해 놓은 것)**

204 status에 관해서 알아볼 때 `Cacheable` 이라는 키워드가 있었는데

캐시할 수 있는  HTTP 응답으로 나중에 검색하고 사용하기 위해 저장하여 새 요청을 서버에 저장한다고 한다.

모든 HTTP 응답을 캐시할 수 있는 것은 아니고 캐시할 HTTP 응답에 대한 제약 조건이 있다고 한다.

- `GET`, `HEAD` 메서드는 요청에 사용된 메서드 그 자체로 캐시 가능

- `POST` 또는 `PATCH` 요청에 대해서는 거의 구현되지 않음.

- `PUT` 또는 `DELETE` 다른 메서드는 캐시 가능하지 않고 그 결과 역시 캐시할 수 없음.

- 애플리케이션 캐싱에 의해 알려진 응답 상태 코드는 캐시 가능한 것으로 간주

- 200, 203, 204, 206, 300, 301, 404, 405, 410, 414, 501 상태 코드는 캐싱 가능

- 응답에는 `Cache-Control`과 같은 캐싱을 방지하는 특정 헤더가 있다.

번역된 글이라서 이해하기 다소 어려운 감이 있다...

캐싱은 주어진 리소스의 복사본을 저장하고 있다가 요청 시에 그것을 제공하는 기술이다.

나중에 사용할 일이 있으면 더 알아봐야겠다. 지금은 사용할 일이 없어서 아예 와닿지가 않는다.

<br />

**참고**

[https://en.wikipedia.org/wiki/List_of_HTTP_status_codes#3xx_redirection](https://en.wikipedia.org/wiki/List_of_HTTP_status_codes#3xx_redirection)

[https://developer.mozilla.org/ko/docs/Web/HTTP/Caching](https://developer.mozilla.org/ko/docs/Web/HTTP/Caching)

[https://developer.mozilla.org/ko/docs/Glossary/cacheable](https://developer.mozilla.org/ko/docs/Glossary/cacheable)
