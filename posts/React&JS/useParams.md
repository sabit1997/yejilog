---
title: "useParams"
date: 2022-08-03 16:13:13
category: "React&JS"
tags: ["React", "useParams"]
isPrivate: false
---

## **1\. useParams란?**

`useParams` hook은 현재 URL에서 Route path와 **일치**하는 동적 파라미터의 값을 반환한다.

## **2\. 사용 예시**

`useParams` 는 주로 고정된 `Route path`가 상황에 따라 변화하는 값을 `path`에 넣어줘야 할 때 사용한다 .

몇가지 예시:

- 쇼핑몰 상품 상세 페이지
- 유저 프로필 페이지 등

예를 들어, 유저 프로필 페이지에서는 A, B, C라는 유저가 있을 때 A 유저의 프로필을 누르면 A 유저 프로필로 이동하고, B 유저의 프로필을 누르면 B 유저의 프로필로 이동해야 한다.

URL은 다음과 같이 구성됩니다.

`/profile/userA`

위 URL에서 `userA` 부분을 기반으로 서버에 요청을 보내 해당 값을 받아와 화면에 표시해야 한다.

**PageRouter.jsx**

```jsx
function PageRouter() {
    return (
			<Routes>
				<Route path="/profile/:accountname" element={<UserProfile />} />
			</Routes>
```

우선 path에서 고정적으로 사용될 `/profile/`부분 뒤에 `:<내가 정한 이름>` 을 적어준다.

**HomePost.jsx**

```jsx
<Link to={`/profile/${datas.author.accountname}`}>
```

우선 `/profile/(여기)`부분에 동적인 값을 넣어준다.

프로필 부분(프로필 사진과 계정 이름 부분)을 클릭하면 해당 글을 작성한 사람의 프로필 페이지로 이동해야 한다.

이 부분은 글마다 글을 작성한 사람의 `accountname`이 달라진다.

이제 저 부분을 어떻게 해서 다른 컴포넌트에서 활용할 수 있을까?

**UserProfile.jsx**

```jsx
const { accountname } = useParams(); // 사용할거라고 선언
// 프로필 데이터 받아오기
useEffect(() => {
  axios
    .get(`https://주소/profile/${accountname}/follower`, {
      headers: {
        Authorization: `Bearer ${getToken}`,
        "Content-type": "application/json",
      },
    })
    .then((res) => {
      // console.log(res);
      setFollowers(res.data);
      console.log(res);
      // console.log(followers);
    })
    .catch((err) => {
      console.log(err);
    });
}, []);
```

먼저, `accountname`을 `useParams`를 사용하여 변수로 선언하고 HomePost에서 받아온 계정 이름을 `accountname`에 할당한다.

이렇게 받은 데이터를 기반으로 다른 경로로 이동하고, 해당 경로의 값을 서버와 통신하여 다른 페이지의 내용을 렌더링할 수 있다.

(+)

추가적으로 현재 `pathname`을 가져오고 싶다면

`useLocation()` 으로 가져올 수 있다!

```jsx
import { useLocation } from "react-router-dom";

const location = useLocation();

console.log(location.pathname);
```

_혹시 틀린 부분이 많을지도 모르니 있다면 피드백 부탁드립니다 👍_

_더 알게 되는 내용이 있다면 추가적으로 수정할 예정입니다._

<br />

**참고**

[https://reactrouter.com/en/main/hooks/use-params](https://reactrouter.com/en/main/hooks/use-params)
