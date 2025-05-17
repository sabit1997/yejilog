---
title: "useEffect"
date: 2022-09-19 17:18:13
category: "React&JS"
tags: ["React", "useEffect"]
isPrivate: false
---

## **1.useEffect란?**

**React 컴포넌트에서 부작용을 관리하는 Hook.**

부작용의 예로는 데이터 가져오기, DOM 직접 업데이트, 타이머 등이 있다.

`useEffect`는 두 개의 인수를 사용할 수 있다. 두 번째 인수는 선택사항이다.

```jsx
useEffect(<function>, <dependency>)
```

## **2\. 사용 법**

```jsx
import { useEffect } from "react";
```

먼저 `useEffect` Hook을 import 해온다.

```jsx
function Timer() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    setTimeout(() => {
      setCount((count) => count + 1);
    }, 1000);
  });

  return <h1>I've rendered {count} times!</h1>;
}
```

이런 식으로 컴포넌트 안에서 `useEffect`를 사용합니다. 다만, 이렇게 사용하면 `useEffect` 안의 함수가 계속해서 실행된다.

이를 제어하기 위해 `dependency` 부분을 사용합니다.

```jsx
useEffect(() => {
  //Runs only on the first render
}, []);
```

빈 배열을 두번째에 넣어주면 페이지가 렌더링 될 때 한 번만 실행하겠다는 의미가 된다.

```jsx
useEffect(() => {
  //Runs on the first render
  //And any time any dependency value changes
}, [prop, state]);
```

만약 뒤에 `props` 나 `state` 같은 값을 넣어준다면 첫번째 렌더링과 이 값들이 변할 때 마다 실행된다.

## **3\. mount 마운트 (처음에 나타났을 때)**

```jsx
function User({ user, onRemove, onToggle }) {
  useEffect(() => {
    console.log('컴포넌트가 화면에 나타남');
  }, []);
```

**마운트 시 하는 작업들**

📌 props 로 받은 값을 컴포넌트의 로컬 상태로 지정

📌 외부 API 요청 (REST API 등)

📌 라이브러리 사용 (D3, Video.js 등...)

📌 setInterval을 통한 반복작업 혹은 setTimeout을 통한 작업 예약

## **4\. unmount 언마운트 (사라질 때)**

일부 효과는 메모리 누수를 줄이기 위해 정리가 필요하다. 더 이상 필요하지 않은 타이머, 이벤트 리스너, `subscriptions` 및 기타 효과를 삭제해야 한다.

`useEffect` Hook의 `return` 부분을 사용하여 이를 수행한다.

```jsx
import { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";

function Timer() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let timer = setTimeout(() => {
      setCount((count) => count + 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return <h1>I've rendered {count} times!</h1>;
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Timer />);
```

`useEffect(<function>, <🚩여기>)` 깃발로 표시된 부분이 비어있다면 컴포넌트가 사라질 때 cleanup 함수가 호출 된다.

**언마운트 시 하는 작업들**

📌 setInterval, setTimeout 을 사용하여 등록한 작업들 clear 하기 (clearInterval, clearTimeout)

📌 라이브러리 인스턴스 제거

## **5\. update 업데이트**

특정 `props`가 바뀔 때, `state` 값이 바뀔 때 `useEffect`를 실행하고 싶다면 다음과 같이 사용한다.

```jsx
useEffect(() => {
  //Runs on the first render
  //And any time any dependency value changes
}, [prop, state]);
```

만약 뒤에 `props` 나 `state` 같은 값을 넣어준다면 **첫번째 렌더링**과 **해당 값들이 변할 때** 마다 실행된다.

**📍틀린 부분이 있다면 말해주세요!**

<br />

**참고**

[https://www.w3schools.com/react/react_useeffect.asp](https://www.w3schools.com/react/react_useeffect.asp)

[https://www.rinae.dev/posts/a-complete-guide-to-useeffect-ko](https://www.rinae.dev/posts/a-complete-guide-to-useeffect-ko)

[https://react.vlpt.us/basic/16-useEffect.html](https://react.vlpt.us/basic/16-useEffect.html)
