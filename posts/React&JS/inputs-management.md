---
title: "여러개의 input 상태 관리"
date: 2022-09-19 01:10:13
category: "React&JS"
tags: ["React", "input", "상태관리"]
isPrivate: false
---

> form에 너무 많은 input이 있어서 각각 useState로 관리하기가 번거로웠고, 사실 이렇게 작성하는 것이 좋은 방법인지에 대한 의문이 들었습니다.

그러던 와중에 [이 글](https://react.vlpt.us/basic/09-multiple-inputs.html)을 발견하여 따라해보니, 여러 개의 `input`을 하나의 `state`로 관리할 수 있어서 편했다!

```jsx
const [inputs, setInputs] = useState({
  receiver: "",
  phone_number1: "",
  phone_number2: "",
  phone_number3: "",
  zip_code: "",
  address1: "",
  address2: "",
  address_message: "",
});
```

우선 `inputs`를 만들고 초기값을 객체로 줬다.

```jsx
const {
  receiver,
  phone_number1,
  phone_number2,
  phone_number3,
  zip_code,
  address1,
  address2,
  address_message,
} = inputs;
```

객체 비구조화 할당을 사용하여 값을 추출한다.

```jsx
function onChange(e) {
  const { value, name } = e.target;
  setInputs({
    ...inputs,
    [name]: value,
  });
}
```

여러 개의 `input`을 제어하는 함수를 만들었다.

```jsx
        <ReceiverInput name="receiver" value={receiver} onChange={onChange} />
          <PhoneNumInput
            name1="phone_number1"
            value1={phone_number1}
            name2="phone_number2"
            value2={phone_number2}
            name3="phone_number3"
            value3={phone_number3}
            onChange={onChange}
          />
          <AddressInput
            name1="zip_code"
            value1={zip_code}
            name2="address1"
            value2={address1}
            name3="address2"
            value3={address2}
            onChange={onChange}
            setInputs={setInputs}
            inputs={inputs}
          />
          <AddressMessageInput
            name="address_message"
            value={address_message}
            onChange={onChange}
          />
```

각 `input`에 `name` 속성으로 객체의 키 값을 주고, `onChange` 함수를 할당했습니다. 이렇게 하면 여러 개의 `input`을 한 번에 제어할 수 있습니다.

만약 `useForm`을 사용하여 `input`을 제어하고 싶다면 거의 비슷하지만 약간은 다르다.

```jsx
<NameTextInputBox
  value={name}
  register={register}
  handleInput={handleInput}
  errors={errors}
  marginB="16px"
/>
```

`value`는 동일하게 작성하고, `input`을 제어하는 함수를 넘겨주고 `register`를 전달한다. 나머지는 `register` 내부에서 처리된다.

```jsx
<Input
  type="text"
  id="input_text_input"
  wd="100%"
  value={value}
  {...register("name", {
    required: "필수 정보입니다.",
    onChange: (e) => {
      handleInput(e);
    },
  })}
/>
```

`register('이름' (위에서 name에 넣었던 이름), {onChange: 값이 바뀔 때 실행될 함수}`

이런식으로 사용해준다. `react-hook-form`을 사용한 자세한 내용은 [이 글](https://sabit1997.github.io/useForm-hook)을 봐주세요!

📍틀린 부분이 있다면 말해주세요!

<br />

**참고**

[https://react.vlpt.us/basic/09-multiple-inputs.html](https://react.vlpt.us/basic/09-multiple-inputs.html)
