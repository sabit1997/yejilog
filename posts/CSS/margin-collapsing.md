---
title: "마진겹침 왜 생기는 걸까?"
date: 2022-04-06 20:34:13
category: "CSS"
tags: ["margin", "마진겹침", "CSS"]
isPrivate: false
---

![image](https://github-production-user-asset-6210df.s3.amazonaws.com/100986977/237144170-aa14c712-81d8-489e-b719-fc1f74381450.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAVCODYLSA53PQK4ZA%2F20250516%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20250516T130437Z&X-Amz-Expires=300&X-Amz-Signature=bab895cdd5c43d3d7c50a3b794762f4b6ee1d2fb8275791c0c19f5d6d1235f11&X-Amz-SignedHeaders=host)

# 마진 겹침

## 1\. 마진 겹침이란?

> 요소와 요소의 사이에 상하 margin의 공간이 있을 경우 더 높은 값이 적용되는 현상

## 2\. 마진 겹침 현상의 조건

- 인접 형제 요소간의 마진은 겹침
- 부모 요소와 형제 요소가 block일 때 분리하는 콘텐츠가 없을 때
- height , min-height, max-height, border, padding, inline 콘텐츠가 없을 때
- **모두 block 이어야 함**

## 인접 형제 요소간의 마진 겹침

![1](https://github-production-user-asset-6210df.s3.amazonaws.com/100986977/237144969-cdb5fd94-77b9-44f9-84e8-815acc0a685c.gif?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAVCODYLSA53PQK4ZA%2F20250516%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20250516T130600Z&X-Amz-Expires=300&X-Amz-Signature=ffed60fd91189e53c5b94867fa0f019ede9206f240d4a9fc54dc99aa87c8e53c&X-Amz-SignedHeaders=host)

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
  </head>
  <style>
    h1 {
      border: 1px solid red;
      margin: 100px;
    }
  </style>
  <body>
    <h1>Hellow world</h1>
    <h1>Hellow world</h1>
  </body>
</html>
```

위와 같이 h1에 모두 공통적으로 margin을 줘서 예상대로라면 두 요소 사이에는 위의 h1의 margin-bottom과 아래의 h1의 margin-top이 있어야 하지만 두개가 겹쳐있는 모습이 보인다.  
첫번째 h1에 margin-bottom을 늘리자 두 요소 사이 margin이 커진다.  
반대로 100px보다 작아지니 두번째 h2 요소의 margin이 적용되는 것을 볼 수 있다.  
(더 큰 margin값을 채택하는 것을 알 수 있음.)

## 3\. 부모와 자식간의 마진 겹침 현상

![2](https://github-production-user-asset-6210df.s3.amazonaws.com/100986977/237145680-46288371-bc51-46c7-ba5a-1191a8971b3f.gif?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAVCODYLSA53PQK4ZA%2F20250516%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20250516T130649Z&X-Amz-Expires=300&X-Amz-Signature=77c6b894f55cb8dffab2b0413017e5688884f0631343c099a6518365f6debec9&X-Amz-SignedHeaders=host)

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
  </head>
  <style>
    .parent {
      /* border: 1px solid coral; */
      margin-top: 100px;
    }
    .child {
      background-color: yellowgreen;
      margin-top: 50px;
    }
  </style>
  <body>
    <div class="parent">
      <div class="child">마진 상쇄 정복해보자!</div>
    </div>
  </body>
</html>
```

border를 주석처리하자 margin이 사라지는 것을 볼 수 있음.

![3](https://github-production-user-asset-6210df.s3.amazonaws.com/100986977/237145683-066c5296-2490-4529-b172-073dd4adfcf3.gif?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAVCODYLSA53PQK4ZA%2F20250516%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20250516T130703Z&X-Amz-Expires=300&X-Amz-Signature=dff9d776be70111c43ce730bd6d1d42b2701c6968b8988a7e7e1bcf651ec9930&X-Amz-SignedHeaders=host)

- child에 margin-top을 값을 늘려주면 100px까지는 child 콘텐츠의 위치가 바뀌지 않지만 100px이 넘어가면 움직이기 시작함
- 또한 50px 이하로 줄여도 child 컨텐츠의 위치는 변하지 않는다.

결론 : parent에 시각적인 요소가 없을 때 parent의 margin값과 child의 margin 값 중에 큰 쪽의 margin 값이 child의 margin값으로 사용됨

## 4\. 빈 요소의 상하 마진 겹침

![4](https://github-production-user-asset-6210df.s3.amazonaws.com/100986977/237145685-204d28cc-d142-47b9-be18-85207229d61a.gif?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAVCODYLSA53PQK4ZA%2F20250516%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20250516T130712Z&X-Amz-Expires=300&X-Amz-Signature=e93a63994626add66d2554ac0d9a057d13f32431b4e5e2a451220c3435f0aa13&X-Amz-SignedHeaders=host)

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
  </head>
  <style>
    .empty {
      margin-top: 50px;
      margin-bottom: 100px;
      /* border: 1px solid salmon; */
    }
    .normal {
      background-color: burlywood;
      margin-top: 100px;
    }
  </style>
  <body>
    <div class="empty"></div>
    <div class="normal">채움</div>
  </body>
</html>
```

아까와 마찬가지로 border 값 (시각적 요소)를 없애자 margin 겹침 현상이 일어나는 것을 볼 수 있음.

![5](https://github-production-user-asset-6210df.s3.amazonaws.com/100986977/237145672-3b2810ae-7db8-4697-9239-c5cfb4cc827e.gif?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAVCODYLSA53PQK4ZA%2F20250516%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20250516T130721Z&X-Amz-Expires=300&X-Amz-Signature=3df55eeef210986db5f19ec88aec43ea32dd55cc6bdd8e394992121b7d410c57&X-Amz-SignedHeaders=host)

위 아래 각각 margin 값을 증가시키자 위 아래 margin 중 더 큰 margin을 채택한다는 사실을 알 수 있음

## 5\. margin 겹침현상이 일어나지 않는 경우

- float: right/left;
- position: absolute;
- display: flex;

## 6\. margin 겹침 해결 방법

- 부모 요소에 overflow: hidden; 속성 값을 적용
- 부모 요소에 display: inline-block 값을 적용
- 부모 요소에 border 값을 적용

<br />

**참고**👀  
[생활코딩 유튜브](https://www.youtube.com/watch?v=zZjTUDAR0ik)  
[MDN 문서](https://developer.mozilla.org/ko/docs/Web/CSS/CSS_Box_Model/Mastering_margin_collapsing)  
교안
