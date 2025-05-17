---
title: "position: sticky; vs position:fixed;"
date: 2022-04-13 20:55:13
category: "CSS"
tags: ["positon", "sticky", "fixed", "CSS"]
isPrivate: false
---

![image](https://github-production-user-asset-6210df.s3.amazonaws.com/100986977/237149789-0884de7d-fbc3-4682-987b-cc8853117d42.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAVCODYLSA53PQK4ZA%2F20250516%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20250516T140056Z&X-Amz-Expires=300&X-Amz-Signature=fb51083eff5b08b266b0e407b25f04b93d5993c3751f9a8631597e5a28b3ddd4&X-Amz-SignedHeaders=host)

# Position 이란?

> 웹 페이지에서 html 태그나 id, class 박스 등의 위치를 지정해주는 속성.  
> position을 이용해 페이지의 레이아웃을 결정할 수 있음.
>
> 기본값인 static을 제외한 값들은 top, right, bottom, left 값에 따라 위치 지정

---

## 1\. position: sticky;

- 요소를 일반적인 문서 흐름에 따라 배치 (공간 차지)
- 가장 가까운 스크롤되는 조상과 컨테이닝 블록(가장 가까운 블록 레벨 조상)을 기준으로 삼음
- 오프셋은 다른 요소의 위치에 영향을 주지 않음
- 항상 새로운 쌓임 맥락을 생성
- 스크롤 동작이 존재하는 가장 가까운 조상에 달라 붙음

### 1-1. 예제

<iframe height="300" style={{ width: '100%' }} scrolling="no" title="Untitled" src="https://codepen.io/sabit1997/embed/KKZxZex?default-tab=html%2Cresult" frameBorder="no" loading="lazy" allowtransparency="true" allowFullScreen={true}>
  See the Pen <a href="https://codepen.io/sabit1997/pen/KKZxZex">
  Untitled</a> by sabit1997 (<a href="https://codepen.io/sabit1997">@sabit1997</a>)
  on <a href="https://codepen.io">CodePen</a>.
</iframe>

---

## 2\. position: fixed;?

- 요소를 일반적인 문서의 흐름에서 제거 (공간 차지하지 않음)
- 뷰포트의 초기 컨테이닝 블록을 기준으로 삼아 배치  
  (단, 요소의 조상 중 하나가 transform, perspective, filter 속성 중 어느 하나라도 none이 아니라면 뷰포트 대신 그 조상을 컨테이닝 블록으로 삼음)
- 스크롤을 올리거나 내릴 때 특정 박스가 고정되어 움직이지 않았으면 한다면 fixed를 사용!
- 스크롤 되어도 중요한 정보를 화면에 계속 노출해주기 위해 사용  
  ex. 네비게이션

### 2-1. 예제

<iframe height="300" style={{ width: '100%' }} scrolling="no" title="fixed" src="https://codepen.io/sabit1997/embed/GRyXOja?default-tab=js%2Cresult" frameBorder="no" loading="lazy" allowtransparency="true" allowFullScreen={true}>
  See the Pen <a href="https://codepen.io/sabit1997/pen/GRyXOja">
  fixed</a> by sabit1997 (<a href="https://codepen.io/sabit1997">@sabit1997</a>)
  on <a href="https://codepen.io">CodePen</a>.
</iframe>

## 3\. 둘의 차이점

- fixed는 고정되어 있지만 sticky는 스크롤을 내리면 가장 가까운 부모에게 찰싹 붙는다.

## 4\. 마치며

- 예제 코드를 혼자 작성하는데, 이해했다고 생각한 sticky에 대해서 다소 모른다는 점을 알았다. 이렇게 공부한 내용을 직접 예제 코드를 적용해보는 것도 좋은 방법인 것 같다!

<br />

**📚참고**  
 [mdn문서](https://developer.mozilla.org/ko/docs/Web/CSS/position)  
 멋쟁이사자처럼 프론트엔드 스쿨 2기 교안
