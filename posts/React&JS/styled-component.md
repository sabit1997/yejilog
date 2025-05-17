---
title: "styled-component를 사용해보자."
date: 2022-09-10 21:50:13
category: "React&JS"
tags: ["styled-component", "style"]
isPrivate: false
---

시작에 앞서 [https://styled-components.com/docs/basics#adapting-based-on-props](https://styled-components.com/docs/basics#adapting-based-on-props) 이 문서에 있는 내용을 바탕으로 작성하였습니다.

## **1\. styled-componeent란?**

> CSS-in-JS 스타일링 프레임 워크

## **2\. 특징 및 이점**

📌 페이지에 렌더링 되는 구성 요소를 추적하고 스타일만 자동으로 넣어준다. 코드 분할과 같이 사용하면 사용자가 필요한 코드를 최소한으로 로드할 수 있다.

\*코드 분할 : 런타임에 여러 번들을 동적으로 만들고 불러오는 것 ( 가장 좋은 방법 import() 문법 사용하기 [자세한 내용](https://ko.reactjs.org/docs/code-splitting.html))

📌 클래스 이름 버그가 없다. 스타일에 대한 고유한 클래스 이름을 생성. 중복 또는 철자 오류에 대해 걱정할 필요가 없음.

📌 쉽게 CSS를 삭제할 수 있다. 스타일링의 모든 부분이 특정 컴포넌트에 연결되어 있기 때문에 컴포넌트가 분명함. 컴포넌트가 사용되지 않고 삭제되면 모든 스타일이 함께 삭제 됨.

📌 간단한 동적 스타일링이 가능. 수십개의 클래스를 수동으로 관리할 필요 없이 컴포넌트의 스타일을 props 나 global 테마에 따라 조정하는 것이 간단하고 직관적임.

📌 유지 보수가 간편함. 컴포넌트에 영향을 미치는 스타일을 찾기 위해 다양한 파일을 검색할 필요가 없음.

## **3\. 사용법**

```
# with npm
npm install --save styled-components

# with yarn
yarn add styled-components
```

우선 설치를 해준다.

`styled` import 해오기

```jsx
import styled from "styled-components";
```

```jsx
const Button = styled.button`
  height: 40px;
  padding: 0 10px;
`;
```

```jsx
const 변수명 = styled.태그`
  // CSS 작성
`;
```

따로 `styled-component` 컴포넌트를 만들어 import해와서 사용해도 되고

해당 컴포넌트 내에서 만들어서 사용해도 된다.

```jsx
import { useState } from "react";
import styled from "styled-components";

export default function App() {
  const [count, setCount] = useState(0);
  return (
    <section>
      <h1>현재 카운트는 {count} 입니다.</h1>
      <Button type="button" onClick={() => setCount(count + 1)}>
        증가
      </Button> // 여기에 사용
      <button type="button" onClick={() => setCount(count - 1)}>
        감소
      </button>
      <button type="button" onClick={() => setCount(0)}>
        초기화
      </button>
    </section>
  );
}

const Button = styled.button`
  height: 40px;
  padding: 0 10px;
`;
```

이렇게 해주고 가져가서 써주면 된다.

### **1️⃣ props 사용해 동적 스타일링**

템플릿 리터럴에 함수를 전달하여 `props`를 기반으로 함수를 적용할 수 있다.

`props`를 `true`로 설정할 때 배경과 텍스트를 바꾸게 되어있다.

<iframe height="300" style={{ width: '100%' }} scrolling="no" title="동적 스타일링" src="https://codepen.io/sabit1997/embed/ZERdzLM?default-tab=js%2Cresult" frameBorder="no" loading="lazy" allowtransparency="true" allowFullScreen={true}>
  See the Pen <a href="https://codepen.io/sabit1997/pen/ZERdzLM">
  동적 스타일링</a> by sabit1997 (<a href="https://codepen.io/sabit1997">@sabit1997</a>)
  on <a href="https://codepen.io">CodePen</a>.
</iframe>

### **2️⃣ 스타일 익스텐즈**

다른 컴포넌트의 스타일을 상속하는 새 컴포넌트를 쉽게 만들려면 `styled()` 사용한다.

<iframe height="300" style={{ width: '100%' }} scrolling="no" title="Untitled" src="https://codepen.io/sabit1997/embed/VwdJZYZ?default-tab=js%2Cresult" frameBorder="no" loading="lazy" allowtransparency="true" allowFullScreen={true}>
  See the Pen <a href="https://codepen.io/sabit1997/pen/VwdJZYZ">
  Untitled</a> by sabit1997 (<a href="https://codepen.io/sabit1997">@sabit1997</a>)
  on <a href="https://codepen.io">CodePen</a>.
</iframe>

### **3️⃣ as**

스타일이 지정된 컴포넌트가 렌더링하는 **태그** 또는 **컴포넌트**를 변경할 수도 있다.

ex.) 앵커 링크와 버튼이 혼합되어 있지만 스타일은 동일해야하는 경우

이 때 `as`를 사용해주면 해결할 수 있다.

<iframe height="300" style={{ width: '100%' }} scrolling="no" title="as 1" src="https://codepen.io/sabit1997/embed/qBKzWXW?default-tab=html%2Cresult" frameBorder="no" loading="lazy" allowtransparency="true" allowFullScreen={true}>
  See the Pen <a href="https://codepen.io/sabit1997/pen/qBKzWXW">
  as 1</a> by sabit1997 (<a href="https://codepen.io/sabit1997">@sabit1997</a>)
  on <a href="https://codepen.io">CodePen</a>.
</iframe>

커스텀 컴포넌트에서도 작동합니다.

<iframe height="300" style={{ width: '100%' }} scrolling="no" title="as2" src="https://codepen.io/sabit1997/embed/NWzZKaw?default-tab=js%2Cresult" frameBorder="no" loading="lazy" allowtransparency="true" allowFullScreen={true}>
  See the Pen <a href="https://codepen.io/sabit1997/pen/NWzZKaw">
  as2</a> by sabit1997 (<a href="https://codepen.io/sabit1997">@sabit1997</a>)
  on <a href="https://codepen.io">CodePen</a>.
</iframe>

### **4️⃣ props 넘기기**

DOM에서 스타일 전달 받을 수 있음.

<iframe height="300" style={{ width: '100%' }} scrolling="no" title="Passed props" src="https://codepen.io/sabit1997/embed/KKejPQe?default-tab=js%2Cresult" frameBorder="no" loading="lazy" allowtransparency="true" allowFullScreen={true}>
  See the Pen <a href="https://codepen.io/sabit1997/pen/KKejPQe">
  Passed props</a> by sabit1997 (<a href="https://codepen.io/sabit1997">@sabit1997</a>)
  on <a href="https://codepen.io">CodePen</a>.
</iframe>

받아오고 싶은 스타일에서 `${props => props.이름 || 기본 스타일}`

`<스타일 컴포넌트 이름='적용하고 싶은 스타일'/>`

이런식으로 하면 DOM에서 넘겨 받을 수 있다!

### **5️⃣ styled component는 외부에서 정의하는 것이 중요함**

내부에서 구성요소를 정의하면 캐싱이 방해되고 렌더링 속도가 현저히 느려진다.

👍

```jsx
const StyledWrapper = styled.div`
  /* ... */
`;

const Wrapper = ({ message }) => {
  return <StyledWrapper>{message}</StyledWrapper>;
};
```

❌

```jsx
const Wrapper = ({ message }) => {
  // WARNING: THIS IS VERY VERY BAD AND SLOW, DO NOT DO THIS!!!
  const StyledWrapper = styled.div`
    /* ... */
  `;

  return <StyledWrapper>{message}</StyledWrapper>;
};
```

#### **6️⃣ 가상요소, 가상선택자, 중첩**

**sscs** 문법을 지원한다.

`&`는 현재 컴포넌트의 모든 인스턴스

<iframe height="300" style={{ width: '100%' }} scrolling="no" title="Untitled" src="https://codepen.io/sabit1997/embed/LYrKPXG?default-tab=js%2Cresult" frameBorder="no" loading="lazy" allowtransparency="true" allowFullScreen={true}>
  See the Pen <a href="https://codepen.io/sabit1997/pen/LYrKPXG">
  Untitled</a> by sabit1997 (<a href="https://codepen.io/sabit1997">@sabit1997</a>)
  on <a href="https://codepen.io">CodePen</a>.
</iframe>

`&&` 는 구성 요소의 인스턴스를 나타냄.이는 **우선순위 부스트**라고 불리는 특별한 동작을 가지고 있다.이는 합성 컴포넌트와 바닐라 css 환경을 다룰 때 유용할 수 있음.

<iframe height="300" style={{ width: '100%' }} scrolling="no" title="&amp;&amp;" src="https://codepen.io/sabit1997/embed/YzvoKMN?default-tab=js%2Cresult" frameBorder="no" loading="lazy" allowtransparency="true" allowFullScreen={true}>
  See the Pen <a href="https://codepen.io/sabit1997/pen/YzvoKMN">
  &amp;&amp;</a> by sabit1997 (<a href="https://codepen.io/sabit1997">@sabit1997</a>)
  on <a href="https://codepen.io">CodePen</a>.
</iframe>

글로벌로 폰트 색깔을 red로 설정했지만 `&&` 를 사용해 blue로 주면 blue로 출력된다.글로벌 스타일과 충돌을 막을 수 있음.

`&` 를 사용하지 않고 선택자를 넣으면 컴포넌트의 하위 항목을 참조한다.

### **7️⃣ 추가적인 props 붙이기**

불필요한 래퍼를 방지하려면 `.arrts`를 사용할 수 있다. 구성 요소에 추가적인 `props`를 부착할 수 있다.

<iframe height="300" style={{ width: '100%' }} scrolling="no" title="Untitled" src="https://codepen.io/sabit1997/embed/jOKjEbb?default-tab=js%2Cresult" frameBorder="no" loading="lazy" allowtransparency="true" allowFullScreen={true}>
  See the Pen <a href="https://codepen.io/sabit1997/pen/jOKjEbb">
  Untitled</a> by sabit1997 (<a href="https://codepen.io/sabit1997">@sabit1997</a>)
  on <a href="https://codepen.io">CodePen</a>.
</iframe>

추가적인 소품에 액세스 할 수 있으며 `type` 속성이 요소에 전달됨.

`input`의 `size` 속성을 재정의 할 수 있습니다.

### **8️⃣ 애니메이션**

`@keyframes` 가 포함된 싱클 컴포넌트는 생성되지 않지만 충돌 위험이 있는 글로벌로 주고 싶지 않기 때문에,

**고유한 이름**으로 내보내 사용한다.

`animation: \${내보낸 이름} 속성;`

<iframe height="300" style={{ width: '100%' }} scrolling="no" title="Animation" src="https://codepen.io/sabit1997/embed/poKXvEE?default-tab=html%2Cresult" frameBorder="no" loading="lazy" allowtransparency="true" allowFullScreen={true}>
  See the Pen <a href="https://codepen.io/sabit1997/pen/poKXvEE">
  Animation</a> by sabit1997 (<a href="https://codepen.io/sabit1997">@sabit1997</a>)
  on <a href="https://codepen.io">CodePen</a>.
</iframe>

## **4\. 마치며**

내가 모르는 부분이 생각보다 많이 있어서 여태 그냥 무작정 사용했던 styled-component 손을 좀 봐야할 것 같다.

프로젝트 끝나고 시간 나는대로 좀 더 보기 좋게 리펙토링 할 예정이다.

**📍틀린 부분이 있다면 말해주세요!**

<br />

**참고**

[https://styled-components.com/docs/basics#adapting-based-on-props](https://styled-components.com/docs/basics#adapting-based-on-props)
