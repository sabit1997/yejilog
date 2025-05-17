---
title: "useNavigate로 데이터 보내기"
date: 2022-10-21 02:28:28
category: "React&JS"
tags: ["React", "useNavigate"]
isPrivate: false
---

## **1\. useNavigate로 데이터 보내기**

```jsx
navigate(to, { state={}, replace=false })
```

특정 이벤트 이후 페이지를 이동할 때 사용된다.

예를 들어, 양식(form)을 제출한 후에 페이지를 이동하고 싶을 때 유용하게 사용할 수 있다.

**사용 예시**

```jsx
import { useNavigate } from "react-router-dom";

function useLogoutTimer() {
  const userIsInactive = useFakeInactiveUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (userIsInactive) {
      fake.logout();
      navigate("/session-timed-out");
    }
  }, [userIsInactive]);
}
```

먼저 `useNavigate`를 가져온 후, `navigate`로 선언합니다. `to`에는 이동하고자 하는 `URL`을, `state`에는 전달하고 싶은 데이터를 넣어줍니다.

## **2\. 활용 예시**

상품 선택 후 주문 페이지로 이동할 때, 상품을 수정할 때 `axios`로 데이터를 다시 불러오는 것보다 `useNavigate`를 사용하여 데이터를 전달하는 것이 더 효율적이라는 생각을 가지게 되었다.

먼저, 상품 등록 시 `productBoxData`라는 이름으로 `null`을 보내준다. (아무 것도 보내지 않을 경우 오류가 발생한다.)

```jsx
<MsIconButton
  src={plusIcon}
  value="상품 업로드"
  wd="168px"
  onClick={() => {
    navigate("/productedit", { state: { productBoxData: null } });
  }}
/>
```

만약 상품을 수정버튼을 누른다면

```jsx
<Btn
  bg="#21BF48"
  onClick={() => {
    navigate("/productedit", {
      state: { productBoxData: productBoxData[i] },
    });
  }}
>
  수정
</Btn>
```

이미 등록된 data를 보내준다.

data를 가져와서 활용하는 법은

```jsx
import { useLocation } from "react-router-dom";

const productBoxData = location.state.productBoxData;
```

먼저 `useLocation`을 import 한 후, `productBoxData`와 같이 원하는 변수명을 사용하여 할당해줍니다.

<br />

**📌틀린 점이나 용어 혼용을 한 경우가 있다면 댓글 남겨주세요!**
