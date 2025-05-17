---
title: "useForm hook"
date: 2022-11-11 20:04:13
category: "React&JS"
tags: ["React", "form", "useForm"]
isPrivate: false
---

현재 진행하는 개인 프로젝트인 오픈 마켓에서 회원가입 부분의 유효성 검사와 `form` 관리를 보다 원활하게 하기 위해 `useForm`을 사용해보기로 결정했다.

처음에는 다른 개발자분들이 사용한 예시 코드를 보고 그대로 따라해보았는데, 이해도 부족하여 오류에 빠지게 되었다...

그래서 무엇이 **필요한 부분**인지 파악하고 해당 내용을 찾아보기로 했다!

✅ 유효성 검사

✅ requried

✅ form에 에러가 있는 상태 & form에 아무런 에러도 없는 상태

✅ 유효성 검사는 어느 시점에 행해질건지 ( 나는 onBlur 상황에 행해지길 원했다)

이러한 내용을 확인한 후, 필요한 부분만 공식 사이트에서 찾아보고 적용해보기로 했다!

---

## **1\. 우선 react-hook-form을 설치한다.**

```
npm install react-hook-form
```

## **2\. 사용할 컴포넌트에서 해당 모듈을 불러온다.**

```jsx
import { useForm } from "react-hook-form";
```

## **3\. 이제 useForm에서 어떤 기능을 사용할 것인지 선언한다.**

```jsx
const {
  register,
  formState: { errors, isValid },
} = useForm({ mode: "onBlur" });
```

여기서는 `input`의 이름을 지정하고 유효성 검사 규칙을 적용하는 데 사용하는 `register`와, 에러 상태일 때 오류 메시지를 표시하고 유효한 상태일 때 서버로 전송 가능하도록 하는 `errors`, `isValid` 상태를 추적하고자 한다. `mode: 'onBlur'`를 사용하여 onBlur 이벤트에서 유효성 검사가 트리거되도록 설정한다.

## **4\. 이제 input에 적용을 시켜줘야 한다.**

```jsx
<IdTextInputBox
  value={userName}
  accountValid={accountValid}
  errors={errors}
  register={register}
  handleInput={handleInput}
/>
```

우선, 나는 input 컴포넌트를 가져와서 쓰고 있기 때문에 register를 넘겨준다.

이제 해당 컴포넌트로 가서

```jsx
<PasswordInput
  type="password"
  id="password_text_input"
  value={value}
  marginB="12px"
  {...register("password", {
    required: "필수 정보입니다.",
    pattern: {
      value: /^(?=.*[a-zA-Z])((?=.*\d)(?=.*\W)).{8,}$/,
      message: "8자 이상, 영문 대 소문자, 숫자, 특수문자를 사용하세요.",
    },
    onChange: (e) => {
      handleInput(e);
    },
  })}
/>
```

다음과 같이 작성한다.

```jsx
required: '필수 정보입니다.', _**필수 작성 요소이고 충족하지 않았을 때의 오류 메세지**_

pattern: {

value: /^(?=.\*\[a-zA-Z\])((?=.\*\\d)(?=.\*\\W)).{8,}\$/,

message: '8자 이상, 영문 대 소문자, 숫자, 특수문자를 사용하세요.',

},

_**유효성 검사 패턴과 오류 메세지**_

onChange: (e) => {

handleInput(e);

},

```

_**해당 컴포넌트가 onChange일 때 작동하는 이벤트 (useState에 변경된 값을 넣어주는 함수임)**_

## **5\. 오류 메세지를 한번 나타내볼까?**

```jsx
{
  errors.password2 && (
    <ValidMessage color="red">{errors.password2.message}</ValidMessage>
  );
}
```

오류 메시지를 표시하고자 하는 위치에 위와 같이 작성한다.

`errors`를 `console.log`로 확인해보면 어떻게 접근하고 사용해야 하는지 더 잘 이해할 수 있다.

## **6\. (부수적인 부분) 오류가 없고, 개인정보 동의에 체크를 한 경우만 버튼이 활성화 되게 하고 싶은데...**

```jsx
{
  (joinType === "BUYER" && checked && doubleCheck && isValid) ||
  (joinType === "SELLER" && checked && doubleCheck && companyNumCheck) ? (
    <>
      <MButton value="가입하기" wd="480px" />
    </>
  ) : (
    <>
      <MDisabledButton value="가입하기" />
    </>
  );
}
```

이렇게 다른 조건과 함께 오류가 `isVaild` 유효한 상태 즉 에러가 없는 상태까지 넣어주면 된다.

---

혹시 틀린 부분이 있다면 언제든 말씀해주세요 👍👍

<br />

**출처**

[https://react-hook-form.com/api/useform/](https://react-hook-form.com/api/useform/)
