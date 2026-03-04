---
title: "setInterval과 requestAnimationFrame"
date: 2025-06-02 22:53:02
category: "Web API"
isPrivate: false
tags:
  [
    "JavaScript",
    "Web API",
    "setInterval",
    "requestAnimationFrame",
    "Timer",
    "Performance",
    "Rendering",
    "Animation",
  ]
---

# 서론

시간의 흐름에 따라 스타일을 “조금씩” 바꾸는 UI는 생각보다 자주 등장합니다. (예: 로딩 바, 물이 차오르는 게이지, 숫자 카운트업, 스켈레톤 shimmer 등)

처음엔 `setInterval`로 “n ms마다 width를 +1%” 같은 방식이 떠오르는데, 막상 해보면

- 프레임(리페인트) 타이밍과 안 맞아서 미묘하게 뚝뚝 끊기거나,
- 탭이 백그라운드로 가면 진행이 틀어지거나(스로틀링),
- 콜백이 조금만 무거워도 시간이 드리프트(누적 오차)되는 문제가 생깁니다.

그래서 “화면에 그리는 애니메이션”이라면 `requestAnimationFrame(이하 rAF)`를 기본 선택지로 두는 게 안전합니다. rAF는 **다음 리페인트 직전에** 콜백을 호출하도록 브라우저에 요청하는 방식이라, 렌더링 루프와 자연스럽게 맞물립니다.

이 글에서는 `setTimeout`, `setInterval`, `requestAnimationFrame`을 “어떤 상황에 무엇을 쓰면 좋은지” 관점에서 정리해보겠습니다.

---

# JS 타이머를 쓰기 전에 꼭 알아둘 것

## 1) “정확히 그 시간에 실행”이 아니라 “그 시간 **이후** 가능한 빨리 실행”

`setTimeout(1000)`이라고 해서 정확히 1000ms에 실행되는 게 아니라,
**최소 1000ms가 지난 뒤** (그리고 메인 스레드가 한가해졌을 때) 실행됩니다.

## 2) 백그라운드 탭에서는 타이머/애니메이션이 느려지거나 멈춘다

대부분의 브라우저는 성능/배터리를 위해

- 백그라운드 탭에서 `setTimeout`/`setInterval`을 스로틀링하고,
- `requestAnimationFrame` 콜백은 아예 중지하는 쪽을 택합니다.

특히 Chrome은 “숨김 상태 + 조용한 페이지 + 체인 타이머” 같은 조건에서 타이머를 더 강하게 제한하는 정책(“intensive throttling”)도 소개하고 있어요.

---

# setTimeout

> `setTimeout()`은 지정한 시간이 지난 뒤 함수를 **한 번** 실행하는 타이머를 설정합니다.

## 언제 쓰면 좋은가

- **1회 지연 실행**(툴팁 300ms 뒤 표시, 토스트 자동 닫기 등)
- **디바운스**(입력 멈춘 뒤 검색)
- `setInterval` 대신 **재귀 setTimeout**으로 “드리프트 보정”이 필요할 때

### 재귀 setTimeout 패턴 (드리프트 줄이기)

```js
let expected = performance.now() + 1000;

function tick() {
  const now = performance.now();
  // 작업...
  expected += 1000;

  const drift = now - (expected - 1000);
  const nextDelay = Math.max(0, 1000 - drift);

  setTimeout(tick, nextDelay);
}

setTimeout(tick, 1000);
```

---

# setInterval

> `setInterval()`은 고정된 시간 지연을 두고 함수를 **반복 호출**합니다. 나중에 `clearInterval()`로 취소할 수 있도록 interval ID를 반환합니다.

## 장점

- 구현이 단순함: “매 1초마다 폴링”, “매 5초마다 배치 작업” 같은 **비-애니메이션 작업**에 편함

## 흔한 함정

### 1) 렌더링 타이밍과 독립적이라 ‘부드러움’이 보장되지 않음

브라우저는 리페인트 주기가 있는데, `setInterval(16)`로 60fps를 흉내내도 **프레임과 안 맞는 순간**이 생겨 끊김이 보일 수 있어요.

### 2) 탭이 백그라운드로 가면 스로틀링으로 시간 기반 UI가 틀어질 수 있음

카운트다운/진행바를 “tick 수”로 계산하면,
백그라운드 탭에서 tick이 듬성듬성 실행되어 **실제 시간과 UI가 어긋납니다.**

✅ 해결의 핵심은 “tick 횟수”가 아니라 **실제 경과 시간**을 기준으로 계산하는 것(= rAF 방식과 동일한 사고방식)입니다.

---

# requestAnimationFrame (rAF)

> `requestAnimationFrame()`은 브라우저가 **다음 리페인트 직전**에 지정된 함수를 호출하도록 요청합니다. 콜백은 보통 디스플레이 주사율에 맞춰 호출됩니다.

## 왜 애니메이션에 유리한가

- **리페인트 타이밍에 맞춰 호출** → 자연스럽게 부드럽게 보임
- 콜백에 timestamp가 들어와서 **“시간 기반 애니메이션”**을 만들기 쉬움
- 백그라운드 탭에서는 보통 **중지**되어 불필요한 CPU/GPU 사용을 줄임

---

# 비교 한눈에 보기

| 구분          | setTimeout          | setInterval            | requestAnimationFrame              |
| ------------- | ------------------- | ---------------------- | ---------------------------------- |
| 실행          | 1회                 | 반복                   | 리페인트 직전 반복(직접 루프 구성) |
| 주 목적       | 지연 실행           | 주기 작업              | 화면 애니메이션/렌더링 업데이트    |
| 정확도        | “최소 지연 후 실행” | 드리프트/스로틀링 영향 | timestamp 기반으로 보정 쉬움       |
| 백그라운드 탭 | 스로틀링됨          | 스로틀링됨             | 보통 중지됨                        |
| 추천 용도     | 디바운스/지연       | 폴링/주기 갱신         | 진행바/트랜지션/게임루프           |

---

# 실전 예제: “물 차오르는” 게이지

## 1) setInterval로 구현 (쉽지만 시간 오차가 나기 쉬움)

```js
let p = 0;
const id = setInterval(() => {
  p += 1;
  box.style.height = `${p}%`;
  if (p >= 100) clearInterval(id);
}, 20);
```

이 방식은 “20ms마다 +1%”라서, 스로틀링/메인스레드 혼잡에 따라 **완주 시간이 달라질 수** 있어요.

## 2) rAF + 시간기반으로 구현

```js
const duration = 2000; // 2초
let rafId = 0;
let start = null;

function animate(ts) {
  if (start === null) start = ts;
  const elapsed = ts - start;
  const t = Math.min(1, elapsed / duration);

  box.style.height = `${t * 100}%`;

  if (t < 1) rafId = requestAnimationFrame(animate);
}

rafId = requestAnimationFrame(animate);

// 필요하면 cancelAnimationFrame(rafId);
```

핵심은 `+1%` 같은 “프레임 의존 업데이트” 대신,
**경과시간 / duration**으로 진행도를 계산하는 것입니다.

---

# React에서 안전하게 쓰는 패턴

## rAF 애니메이션 컴포넌트 예시

```tsx
import { useEffect, useRef, useState } from "react";

export function FillGauge({ duration = 2000 }: { duration?: number }) {
  const [progress, setProgress] = useState(0); // 0~1
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    let start: number | null = null;

    const loop = (ts: number) => {
      if (start === null) start = ts;
      const t = Math.min(1, (ts - start) / duration);
      setProgress(t);

      if (t < 1) rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [duration]);

  return (
    <div
      style={{ height: 200, border: "1px solid #ddd", position: "relative" }}
    >
      <div
        style={{
          position: "absolute",
          bottom: 0,
          width: "100%",
          height: `${progress * 100}%`,
          background: "dodgerblue",
          transition: "none",
        }}
      />
    </div>
  );
}
```

### React에서 포인트

- `rafId/intervalId`는 `useRef`에 넣고 cleanup에서 취소
- 상태 업데이트가 잦으면 렌더가 부담될 수 있어, **DOM 스타일을 직접 건드리는 방식**(ref로 element 잡고 `style` 변경)도 종종 더 낫습니다(상황 따라 선택).

---

# 결론: 언제 뭘 쓰면 깔끔한가

- **화면에 보이는 애니메이션/진행도** → `requestAnimationFrame` (그리고 “시간 기반” 계산)
- **비주얼이 아닌 주기 작업(폴링/통계/로그)** → `setInterval` 또는 재귀 `setTimeout`
- **백그라운드에서도 정확해야 하는 시간 표시(카운트다운 등)** → 타이머 tick이 아니라 `Date.now()`/`performance.now()`로 “실제 시간”을 기준으로 다시 계산 + `visibilitychange` 같은 이벤트로 동기화

---

### 참고 👀

- [MDN setInterval](https://developer.mozilla.org/ko/docs/Web/API/Window/setInterval)
- [MDN clearInterval](https://developer.mozilla.org/ko/docs/Web/API/Window/clearInterval)
- [MDN setTimeout](https://developer.mozilla.org/ko/docs/Web/API/Window/setTimeout)
- [MDN requestAnimationFrame](https://developer.mozilla.org/ko/docs/Web/API/Window/requestAnimationFrame)
- [MDN Page Visibility API](https://developer.mozilla.org/ko/docs/Web/API/Page_Visibility_API)
- [Chrome 타이머 스로틀링(Chrome 88)](https://developer.chrome.com/blog/timer-throttling-in-chrome-88)
