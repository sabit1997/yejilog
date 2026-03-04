---
title: "React 타이머 드리프트 해결: setInterval → setTimeout 재귀로 변경"
date: 2025-07-17 22:56:21
category: "React&JS"
isPrivate: false
tags:
  [
    "React",
    "Timer",
    "setInterval",
    "setTimeout",
    "Troubleshooting",
    "Performance",
  ]
---

## 서론

캠스터디 앱에 **공부 타이머**를 붙이면서, 나는 당연히 이렇게 시작했다.

> “1초마다 숫자 올리면 되지~”

그래서 `setInterval(..., 1000)`로 1초마다 `elapsed`를 증가시키고,  
1분마다 서버에 기록 저장(persist)도 `setInterval(..., 60000)`로 돌렸다.

그런데 시간이 좀 지나면… 미묘하게 체감이 이상했다.

- 타이머가 “정확히” 흐르지 않는 느낌
- 저장 주기가 밀리는 느낌 (특히 백그라운드/비활성 상태에서)
- 혹시라도 start가 중복으로 걸리면? (React 개발환경에서 특히 불안)

공식 문서/스펙도 결국 한 말을 한다.

> 타이머는 “정확히” 그 시간에 실행된다고 보장되지 않는다.  
> CPU 로드, 다른 작업, 브라우저 정책(백그라운드 탭 스로틀링) 등에 의해 지연될 수 있다.

그래서 나는 **setInterval을 걷어내고**,  
**setTimeout 재귀(Recursive setTimeout)** 로 바꾸는 방식으로 정리했다.

---

## 문제: setInterval은 “정확한 1초”가 아니다

### 1) 스펙/문서적으로 타이머는 정확하지 않다

- `setInterval`/`setTimeout`은 지정한 시간에 “정확히” 실행되는 게 아니라  
  “그 시간 이후에 실행될 수 있다”에 가깝다.
- 즉 이벤트 루프가 바쁘면 콜백이 밀릴 수 있다.

(이건 구현체마다 다르지만, “정확한 스케줄링을 보장하지 않는다”는 점은 공통이다.)

### 2) 백그라운드 탭/비활성 상태에서는 더 크게 흔들린다

브라우저는 리소스 절약을 위해, 백그라운드 탭의 타이머를 강하게 제한하기도 한다.  
(예: Chrome은 조건에 따라 백그라운드 타이머를 더 강하게 스로틀링한다.)

---

## 기존 코드: setInterval 2개(1초 tick + 60초 저장)

내가 처음 썼던 형태는 대략 이런 흐름이었다.

- 1초마다 `elapsed + 1`
- 60초마다 “실제 시간 기반 보정(corrected)” + 서버 저장(postTime)

```tsx
// before (요약)

timerRef.current = setInterval(() => setElapsed((prev) => prev + 1), 1000);

saveRef.current = setInterval(() => {
  if (!startAtRef.current) return;
  const now = new Date();

  const deltaSec = Math.floor(
    (now.getTime() - startAtRef.current.getTime()) / 1000
  );
  const corrected = baseTotalSecondsRef.current + deltaSec;

  setElapsed(corrected);
  postTime({
    startAt: startAtRef.current.toISOString(),
    endAt: now.toISOString(),
  });

  baseTotalSecondsRef.current = corrected;
  startAtRef.current = now;
}, 60000);
```

겉보기엔 문제 없어 보이는데, “타이머는 정확하지 않다” + “백그라운드 스로틀링”이 겹치면
내가 기대한 주기(1초/60초)가 깨질 수 있었다.

---

## 개선 코드: setTimeout 재귀(1초 tick + 60초 저장)

이번 커밋에서 바꾼 핵심은 아래 3가지다.

1. `setInterval` → `setTimeout` 재귀로 변경
2. stop/unmount cleanup도 `clearTimeout`으로 일관성 유지
3. startTimer 중복 방지 조건 강화 (`timerRef || saveRef || isPending`)

### 1) 타입도 setTimeout에 맞게 정리

```tsx
const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
const saveRef = useRef<ReturnType<typeof setTimeout> | null>(null);
```

### 2) 1초 tick을 재귀 setTimeout으로

```tsx
const tick = () => {
  timerRef.current = setTimeout(() => {
    setElapsed((prev) => prev + 1);
    tick(); // 다음 tick 예약
  }, 1000);
};
tick();
```

`setInterval`은 “원래 주기대로 계속 호출하려는 성질”이 있고,
이벤트 루프가 밀리면 콜백이 쌓이거나(혹은 기대한 타이밍에서 멀어지거나) 체감이 이상해질 수 있다.

반면 재귀 `setTimeout`은 “이번 콜백이 끝난 다음에 다음 호출을 예약”하니까
나에게는 디버깅/제어가 더 단순했다.

### 3) 60초 저장(persist)도 재귀 setTimeout으로

```tsx
const persist = () => {
  saveRef.current = setTimeout(() => {
    if (!startAtRef.current) return;

    const now = new Date();
    const deltaSec = Math.floor(
      (now.getTime() - startAtRef.current.getTime()) / 1000
    );
    const corrected = baseTotalSecondsRef.current + deltaSec;

    setElapsed(corrected);
    postTime({
      startAt: startAtRef.current.toISOString(),
      endAt: now.toISOString(),
    });

    baseTotalSecondsRef.current = corrected;
    startAtRef.current = now;

    persist(); // 다음 persist 예약
  }, 60000);
};
persist();
```

여기서 중요한 점은:

- “1초마다 증가”는 UI 표시용이고,
- “진짜 시간 보정”은 `Date` 차이로 60초마다 한 번씩 확실히 맞춘다는 것.

즉, 타이머가 약간 밀려도 **서버 기록과 elapsed는 주기적으로 보정**된다.

---

## stop / cleanup도 clearTimeout으로 정리

startTimer에서 setTimeout을 쓰면 stop/unmount에서도 `clearTimeout`이 맞다.

```tsx
if (timerRef.current) {
  clearTimeout(timerRef.current);
  timerRef.current = null;
}
if (saveRef.current) {
  clearTimeout(saveRef.current);
  saveRef.current = null;
}
```

그리고 언마운트 cleanup에서도 동일하게 처리했다.

---

## (소소하지만 중요) startTimer 중복 실행 방지

이 부분이 은근 중요했다.

```tsx
if (timerRef.current || saveRef.current || isPostTimePending) return;
```

- `timerRef`만 체크하면 “persist 쪽(setTimeout)”이 중복으로 걸릴 가능성이 있다.
- 그래서 `saveRef.current`도 같이 체크하도록 강화했다.

---

## 결과

- 장시간 실행 시에도 체감상 타이머가 덜 “삐끗”했다.
- 특히 저장(persist) 로직이 더 예측 가능해졌다.
  (중복 실행/cleanup 꼬임 가능성도 줄어듦)
- “타이머는 정확하지 않다”는 전제를 코드 구조로 반영하게 됐다.

---

## 느낀 점

- 타이머를 만들면, 결국 “정확한 시간”은 `Date.now()`(혹은 `performance.now()`) 같은 기준 시각으로 맞추는 게 정답에 가깝다.
- 브라우저는 백그라운드에서 타이머를 마음대로 느리게 만들 수 있다.
  “내가 설정한 1초/60초가 절대적”이라는 전제는 버려야 한다.

---

## 📚 참고 링크

- [MDN `setInterval`](https://developer.mozilla.org/en-US/docs/Web/API/Window/setInterval)
- [MDN `setTimeout`](https://developer.mozilla.org/en-US/docs/Web/API/Window/setTimeout)
- [WHATWG HTML Spec — Timers](https://html.spec.whatwg.org/multipage/timers-and-user-prompts.html)
- [Chrome Dev Blog — Timer throttling in Chrome 88](https://developer.chrome.com/blog/timer-throttling-in-chrome-88)
