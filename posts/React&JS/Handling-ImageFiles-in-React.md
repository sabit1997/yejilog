---
title: "이미지 파일을 다루면서 생겼던 일: React에서 이미지 파일 미리보기 및 서버 전송하기"
date: 2022-09-19 01:11:13
category: "React&JS"
tags: ["React", "이미지 파일", "미리보기"]
isPrivate: false
---

# **이미지 프리뷰 나타내기**

## `<input type="file">` 로 입력한 파일의 URL에 직접 접근할 수 없는 이유

브라우저는 “동일 출처 정책”(**Same-Origin Policy**)을 구현하여 한 출처에서 로드된 문서나 스크립트가 다른 출처의 리소스와 상호 작용하지 못하도록 합니다. 이는 브라우저에서 실행 중인 스크립트가 다른 출처로 간주되어 사용자 시스템의 파일에 직접 액세스할 수 없음을 의미합니다. 이 정책은 악성 웹사이트가 잠재적으로 민감한 로컬 파일을 읽을 수 있는 위험을 완화하는 데 도움이 됩니다.

따라서, 브라우저에서 실행되는 스크립트는 로컬 파일에 직접 접근할 수 없습니다. 로컬 파일은 다른 출처로 간주되기 때문입니다. 만약 브라우저가 로컬 파일의 URL을 직접 읽을 수 있다면 보안상의 문제가 발생할 수 있으므로 URL.createObjectURL()을 통해 객체의 URL을 생성해야 합니다.

`<input type="file">` 의 files를 console.log로 출력해보면 다음과 같이 나옵니다.
![files-console.log-예시](/react/image.png)

`URL.createObjectURL`을 사용하면 다음과 같이 URL을 생성할 수 있습니다.
![URL.careatObjectURL console.log 출력 예시](/react/image-1.png)

MDN 문서의 예제에서도 preview 를 나타낼 때 `URL.createObjectURL`을 사용하는 것을 볼 수 있습니다.

https://developer.mozilla.org/ko/docs/Web/HTML/Element/input/file#%EC%98%88%EC%A0%9C

## React에서 적용한 코드

```jsx
<input
  id="imageUploadInput"
  type="file"
  accept="image/*"
  ref={inpRef}
  onChange={handleImgPreview}
  className="ir"
/>
```

```jsx
// 이미지 미리보기
function handleImgPreview(e) {
  setPreview(URL.createObjectURL(e.target.files[0]));
}
```

![img](https://github-production-user-asset-6210df.s3.amazonaws.com/100986977/237408850-ad55c0d5-e98e-451b-97d5-b38b767e207b.gif?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAVCODYLSA53PQK4ZA%2F20250516%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20250516T134104Z&X-Amz-Expires=300&X-Amz-Signature=f600c99d6b75ee8f919bf0560dcbdf3eafa300782b0c0420481a52e5ec1590ab&X-Amz-SignedHeaders=host)

# **이미지 서버에 전송하기**

## file을 FormData로 전송해야하는 이유

FormData는 이미지 파일과 같은 바이너리 파일 데이터 양식을 서버로 보내야 할 경우에 사용됩니다.

스택오버플로우에서는 FormData가 파일을 전송하는 유일하게 합리적인 방법이라고 설명하고 있습니다.

[Why should FormData be used when uploading a file via AJAX?](https://stackoverflow.com/questions/55852521/why-should-formdata-be-used-when-uploading-a-file-via-ajax)

“FormData 객체를 사용하면 키/값 쌍 집합을 컴파일하여 Fetch 또는 XMLHttpRequest API를 사용하여 전송할 수 있습니다. 주로 양식 데이터를 전송하는 데 사용되지만 키 데이터를 전송하기 위해 양식과 독립적으로 사용할 수도 있습니다. “ 라고 합니다.

처음에는 이 방법을 몰라 여러 가지로 시도해보았는데,

- URL.createObjectURL()로 생성된 값 그대로 보내기
- File을 FormData를 거치지 않고 그대로 보내기

이 두 가지 방법이었습니다…

이러한 방법들은 서버에서 바이너리 형식의 데이터를 요구했기 때문에 제대로 작동하지 않습니다.

## async await 사용 이유

이미지를 먼저 서버에 보내 URL 값을 받아온 후, 그 URL 값과 함께 다른 form에 입력된 값들을 전달해야 했습니다. 그래서 비동기적으로 작동하도록 async/await을 사용하기로 했습니다.

그렇기 때문에 비동기적으로 작동해야 하기 때문에 async await 을 사용하기로 했다.

### **비동기 작업의 필요성**

비동기 작업을 통해 이미지를 업로드한 후 반환된 URL을 받아 다른 데이터와 함께 서버에 전송할 수 있습니다. 이를 통해 전체 프로세스가 원활하게 진행되도록 합니다.

## React 적용 코드

```jsx
// 상품등록 데이터 전송
const createProduct = async (e) => {
  e.preventDefault();
  if (state) {
    const url = "<https://주소.co.kr>";
    const getToken = localStorage.getItem("token");
    const res = uploadImage();
    try {
      await axios.post(
        `${url}/product`,
        {
          product: {
            itemName: name,
            price: parseInt(
              price.split(",").reduce((curr, acc) => curr + acc, "")
            ),
            link: link,
            itemImage: await res, // 이미지 파일 데이터 받아오기
          },
        },
        {
          headers: {
            Authorization: `Bearer ${getToken}`,
            "Content-type": "application/json",
          },
        }
      );
      navigate("/myprofile");
    } catch (error) {
      console.log(error);
    }
  }
};
```

📍틀린 부분이 있다면 말해주세요!

<br />

**참고**

[Why local links are disabled by default in modern browsers?](https://security.stackexchange.com/questions/153706/why-local-links-are-disabled-by-default-in-modern-browsers)

[async function - JavaScript | MDN](https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Statements/async_function)

[Blob - Web API | MDN](https://developer.mozilla.org/ko/docs/Web/API/Blob)
