---
title: "이미지를 서버에 전송해보자. (feat. FormData, async/await)"
date: 2022-09-02 20:23:13
category: "React&JS"
tags: ["이미지", "React", "FormData", "async/await"]
isPrivate: false
---

## **1\. 실수 분석**

상품을 등록할 때 이미지도 서버에 전송해야 하는데, 이미지 미리보기 기능을 구현한 후 그 값을 그대로 전송하려고 했다.

```jsx
// 미리보기 이미지
const handleImageInput = (e) => {
  setPreview(URL.createObjectURL(e.target.files[0]));
};
```

이렇게 하면 값이 아래와 같이 나오고, 이 값을 그대로 전송하려고 했다.

`blob:http://주소/cb21c13b-1944-42ad-8aa4-94611177989a`

그래서 `blob:`을 제거하고 전송하려고 했는데, 당연히 제대로 전송되지 않았다.

또한, 정확히 어떻게 사용해야 할지 몰라서 `FormData`를 사용해야 한다는 것은 알았지만 많은 시행착오를 겪었다.

## **2\. 해결 방법**

먼저, API를 살펴보니 이미지를 업로드하는 별도의 API가 있었다!

동료의 도움으로 폼을 제출하기 전에 이미지 데이터를 받아와서 폼 제출 시 함께 완료하면 될 것 같다는 결론을 얻게 되었습니다.

```jsx
// 이미지 업로드
const uploadImage = async () => {
  let formData = new FormData(); // FormData 생성
  const imgFile = inpRef.current.files; // 이미지 파일 가져오기
  const file = imgFile[0]; // 이미지 파일이 한개라 0번 인덱스에 접근해 값 가져오기
  formData.append("image", file); // image라는 키에 file이라는 값 넣기
  const res = await axios.post(
    // await에 넘겨서 완료 될 때까지 기다리기
    "<https://주소/image/uploadfile>",
    formData
  );
  const imgUrl = `https://주소/${res.data.filename}`;
  // 보낸 이미지 파일 데이터 받아서 저장
  return imgUrl;
};
```

1.  폼 제출 전에 실행해야하니 `async function`으로 비동기 함수를 정의해준다.
2.  `file`을 `key/value` 로 보낼 것이기 때문에 `new FormData()`로 `FormData`를 생성해준다.
3.  이미지 파일에 접근해 값 가져오기
4.  `FormData`에 `key`, `value` 넣어주기
5.  `await`으로 이미지 파일이름 받아오기

```jsx
// 상품등록 데이터 전송
const createProduct = async (e) => {
  e.preventDefault();
  if (state) {
    // 추후에 로그인 기능 구현되면 삭제. 일회성 토큰
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

1. 폼 제출 함수에서 먼저 비동기로 실행되도록 하여 `const res = uploadImage();`를 실행해 이미지 파일 데이터를 받아온다.
2. itemImage에 이미지 파일 데이터를 받아온 후 폼이 제출되도록 한다!

이런 식으로 해결 완료!

<br />

**참고**

[https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Statements/async_function](https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Statements/async_function)

[https://developer.mozilla.org/ko/docs/Web/API/FormData/FormData](https://developer.mozilla.org/ko/docs/Web/API/FormData/FormData)

[https://reactjs.org/docs/hooks-reference.html#useref](https://reactjs.org/docs/hooks-reference.html#useref)
