---
title: "SSE 알림이 “누적되지 않던” 문제 해결하기 (트랜잭션 이벤트 + 응답 정규화 + 인증 타이밍) – React + Spring"
date: 2026-03-03 19:35:18
category: "React&JS"
tags:
  - "React"
  - "SSE"
  - "EventSource"
  - "Spring"
  - "SseEmitter"
  - "TransactionalEventListener"
  - "Spring Security"
isPrivate: false
---

# 서론

이번에 알림을 SSE(Server-Sent Events)로 붙이면서 제일 크게 겪었던 문제는 

> **알림이 DB에 제대로 누적되지 않아서, 새로고침하면 사라지거나 목록에서 비어 보이는 문제 (맨 처음에 회원가입 시 주는 point에 대한 알림만 남고 왔던 알림은 알림을 get했을 때 보이지 않음)**

였습니다.

증상은 대충 이런 형태로 반복됐어요.

* 실시간으로는 알림이 “온 것처럼” 보이는데
* 새로고침하거나 `/notifications`로 다시 조회하면 **방금 알림이 없음**
* 심지어 “읽음 처리” 후 모달을 다시 열면 목록이 **갑자기 사라진 것처럼** 보이기도 함

SSE 자체는 `EventSource`로 연결만 열면 되는데,
“실시간 + 누적(영속성)”을 동시에 만족시키는 게 진짜 포인트였습니다.

---

# 문제 상황: 기대한 흐름 vs 실제 흐름

## 기대한 흐름

1. 이벤트 발생(댓글/구독/구매 등)
2. 서버가 알림을 **DB에 저장**
3. 저장된 알림을 SSE로 **push**
4. 프론트는 SSE 수신 후 UI 갱신
5. 새로고침해도 목록 API에서 **누적된 알림이 그대로 조회**

## 실제로는

- **(BE)** “저장 완료 로그는 찍히는데 DB에 실제로 안 남는” 케이스가 있었고
- **(FE)** “DB에는 있어도 목록이 사라지거나 누락처럼 보이게 만드는” 케이스도 겹쳐 있었습니다.

그래서 결론적으로 **백엔드/프론트 둘 다 손을 봐야** 했습니다.
(문제는 하나였는데, 증상은 여러 레이어에서 동시에 튀어나오는 느낌…)

---

# 1) 백엔드: “이벤트는 뜨는데 DB 저장이 누락”되는 진짜 원인

## 1-1. 핵심: `@TransactionalEventListener(AFTER_COMMIT)` + 트랜잭션 부재

알림 저장 로직을 이벤트 리스너로 분리했고, 리스너는 `AFTER_COMMIT`로 동작하도록 구성했었습니다.

여기서 함정은:

- `AFTER_COMMIT`은 **메인 트랜잭션 커밋 이후** 실행되는데
- 리스너 메서드가 **별도 트랜잭션 없이** 동작하면, DB 쓰기가 “기대처럼 커밋되지 않는” 상황이 생길 수 있었습니다.

그래서 서버 로그에는 `[알림] 저장 완료`가 찍혀도,
실제 `notifications` 테이블엔 `COMMENT/SUBSCRIBE`가 안 남고
`GET /notifications`엔 “가입축하(ALARM)만 보이는” 상태가 됐습니다.

> 즉, **실시간 push는 된 것처럼 보여도, 영속성(누적)이 깨져 있던** 상태였어요.

---

## 1-2. 해결: 리스너 저장을 `REQUIRES_NEW`로 강제

결국 해결은 “알림 저장은 알림 트랜잭션으로 따로 커밋”하게 만드는 거였습니다.

```java
@Transactional(propagation = Propagation.REQUIRES_NEW)
@TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
public void handleCommentEvent(CommentEvent event) {
  // 알림 저장 + SSE 전송
}
```

- 메인 비즈니스 트랜잭션(댓글/구매/구독)이 성공적으로 끝난 뒤
- 알림 저장은 **새 트랜잭션을 열어 독립적으로 커밋**
- 그래서 “로그만 찍히고 DB는 비어 있는” 상태가 사라졌습니다

적용 대상은 아래 핸들러들이었어요.

- `handlePurchaseEvent`
- `handleCommentEvent`
- `handleSubscribeEvent`

---

## 1-3. (추가 안정화) 이벤트 payload를 엔티티 → 원시값으로 얇게

초기에는 이벤트 payload에 엔티티를 통째로 담았는데,

- `AFTER_COMMIT` 이후 엔티티가 detached 상태가 되거나
- 지연로딩 관계 때문에 예기치 않은 문제가 생길 수 있어

payload를 “값 기반”으로 변경했습니다.

```java
public record CommentEvent(String commenterNickname, UUID ownerId, UUID storeId) {}
```

그리고 리스너에서 필요한 건 다시 조회:

```java
var owner = memberRepository.findById(event.ownerId()).orElse(null);
if (owner == null) return;

notificationService.sendCommentNotification(
  owner,
  event.commenterNickname(),
  event.storeId()
);
```

이렇게 바꾸면 “커밋 이후 시점에 엔티티 참조 때문에 흔들리는 문제”를 피할 수 있습니다.

---

## 1-4. (디버깅 포인트) “SSE 수신 계정” vs “목록 조회 계정” 불일치 탐지

중간에 가장 의심했던 게 이거였습니다.

- 로그에 저장됨: `receiverId=c85a8094-..., type=SUBSCRIBE`
- 근데 `/notifications` 응답엔 가입축하 1개만 옴

이 상황이면 **조회 계정 ≠ 수신 계정**일 가능성이 크거든요.

그래서 바로 확인하도록 백엔드에서:

1. `/notifications` 응답 헤더에 `X-Debug-Member-Id` 추가
2. SSE 초기 이벤트에도 debug memberId를 같이 실어줌
3. 두 값을 비교하면 “인증 주체가 섞였는지” 바로 보이게 했습니다

> 이 작업 덕분에, “진짜 DB 저장이 누락된 문제”와 “인증 주체 불일치로 누락처럼 보이던 문제”를 분리해서 볼 수 있었어요.

---

# 2) 프론트엔드: “저장돼 있는데도 사라져 보이는” 문제들

백엔드 저장을 안정화하고 나서도, 프론트 쪽에서 UX가 흔들리는 지점이 남아있었습니다.
여기서 핵심은 3가지였습니다.

1. **읽음 처리 직후 invalidate로 즉시 재조회**
2. **REST/SSE 인증 경로가 섞일 가능성**
3. **SSE payload 파싱/이벤트 수신이 취약**

---

## 2-1. 읽음 처리 후 invalidate가 “목록 소실처럼 보이게” 만들던 문제

핵심 원인 중 하나는 이 패턴이었습니다.

- 읽음 처리 API 성공
- `invalidateQueries`로 즉시 재조회
- 근데 이 재조회가 타이밍/인증 문제로 빈 배열로 떨어지면
  → 사용자 입장에선 “읽자마자 목록이 사라짐”

그래서 아래처럼 변경했습니다.

### 적용한 방식: “읽음 후 목록 유지”

- `useUpdateNotification`의 `onSuccess`에서 `invalidateQueries` 제거
- 대신 **낙관적 업데이트(isRead=true)** 만 유지

```ts
// onSuccess에서 invalidateQueries 제거
// 낙관적 업데이트로 UI만 먼저 반영
```

> 읽음 처리는 “목록에서 사라지는 액션”이 아니라 “상태만 바뀌는 액션”이라
> UX 관점에서도 낙관적 업데이트가 더 안정적이었습니다.

---

## 2-2. 인증 경로 단일화 (FE에서 가장 중요했던 포인트)

당시 구조가 이렇게 갈라질 여지가 있었어요.

- **SSE**: 쿠키 인증(withCredentials)
- **REST**: 쿠키 + Authorization 헤더 자동 주입
  → 토큰 상태/갱신 타이밍에 따라 “다른 사용자로 해석될 여지”

그래서 아예 **한 가지로 통일**했습니다.

### 적용한 방식: 쿠키 기반으로 통일

- `src/services/axios.ts`에서 **Authorization 자동 주입 제거**
- refresh 재시도 시 **Authorization 재설정도 제거**
- REST/SSE 모두 쿠키 기반(withCredentials)으로 통일
  → 동일 사용자 컨텍스트 보장

> “SSE는 A 계정으로 구독 중인데, 목록 조회는 B 계정으로 조회”
> 같은 상황이 생기면, 그 순간부터 모든 증상이 ‘랜덤’처럼 느껴지기 시작합니다.
> 그래서 이건 진짜로 **가장 먼저 고정해야 하는 축**이었어요.

---

## 2-3. SSE 수신 안정화 (payload/이벤트/노이즈 방어)

SSE 스트림은 텍스트 스트림이라, 아래가 자주 발생합니다.

- `keep-alive` 같은 문자열
- JSON 아닌 메시지
- 이벤트 이름이 `message`가 아닌 커스텀 이벤트로 올 수도 있음

또, 서버 응답 필드가 간헐적으로 `date` 대신 `localDateTime`으로 오면서
프론트 타입가드가 “이상한 데이터”로 판단하고 버리는 문제도 있었습니다.

그래서 수신 로직을 아래처럼 보강했습니다.

### (1) 응답 정규화: `date` 없으면 `localDateTime` 사용

```ts
const normalizeNotification = (item: NotificationResponse) => {
  const candidate = item as NotificationResponse & { localDateTime?: string };
  return { ...item, date: item.date ?? candidate.localDateTime ?? "" };
};
```

### (2) 이벤트 리스너 보강: `message` + `notification` 둘 다 등록

```ts
es.addEventListener("message", onEvent);
es.addEventListener("notification", onEvent);
```

### (3) keep-alive/비JSON payload는 무시

```ts
if (!event.data || event.data === "keep-alive") return;

try {
  const parsed = JSON.parse(event.data);
  const normalized = normalizeNotification(parsed);
  // ...
} catch {
  return; // 비 JSON은 조용히 무시
}
```

### (4) 스트림 종료 유틸로 cleanup 명확화

- `disconnectNotificationStream`로 `close()` 호출을 한 군데로 모으고
- 언마운트/페이지 전환/재구독 시 중복 연결을 줄였습니다

> 참고로 `emitterCount=4` 같은 로그가 보이면
> 프론트에서 중복 구독(StrictMode, 리렌더, cleanup 누락)을 의심하는 게 좋습니다.

---

# 최종 정리: 원인과 해결을 한 장으로

| 구분 | 문제(원인)                                                                        | 해결(적용)                                                                      |
| ---- | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| BE   | `AFTER_COMMIT` 리스너에서 저장 트랜잭션이 보장되지 않아 “로그만 찍히고 DB 미저장” | 리스너 핸들러에 `@Transactional(REQUIRES_NEW)` 적용                             |
| BE   | AFTER_COMMIT 이후 엔티티 참조로 detached/지연로딩 이슈 가능                       | 이벤트 payload를 엔티티 → 원시값(UUID/문자열)로 변경                            |
| FE   | 읽음 처리 후 `invalidate`로 즉시 재조회 → 타이밍 이슈 시 “목록 소실처럼” 보임     | onSuccess에서 invalidate 제거 + 낙관적 업데이트 유지                            |
| FE   | SSE(쿠키) vs REST(쿠키+Authorization)로 인증 주체가 섞일 여지                     | axios Authorization 자동 주입 제거 → **쿠키 기반 통일**                         |
| FE   | `localDateTime`/커스텀 이벤트/keep-alive로 메시지 누락                            | 수신 정규화 + `message/notification` 동시 리스너 + 비JSON 무시 + 명확한 cleanup |

---

# 느낀 점

이번 케이스는 “SSE 연결이 안 된다” 같은 단순 문제가 아니라,

- 저장 트랜잭션이 실제로 커밋되는지(영속성)
- 인증 주체가 레이어마다 일관된지(쿠키/토큰 섞임)
- 프론트가 스트림 노이즈/스키마 차이를 방어하는지(정규화/파싱)

이 3가지를 동시에 잡아야 “실시간 + 누적”이 안정화되더라고요.

특히 **“누적이 안 된다”는 문제는 결국 DB에 남는 경로부터 안정화해야** 했고,
그 다음에야 프론트에서 “누락처럼 보이게 만드는 지점”들이 정리됐습니다.

---

### 참고자료 📚

- [Server-Sent Events 사용하기 (MDN)](https://developer.mozilla.org/ko/docs/Web/API/Server-sent_events/Using_server-sent_events)
- [EventSource `withCredentials` (MDN)](https://developer.mozilla.org/ko/docs/Web/API/EventSource/withCredentials)
- [Server-sent events (WHATWG HTML Spec)](https://html.spec.whatwg.org/multipage/server-sent-events.html)
- [`SseEmitter` (Spring Javadoc)](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/web/servlet/mvc/method/annotation/SseEmitter.html)
- [`TransactionalEventListener` (Spring Javadoc)](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/transaction/event/TransactionalEventListener.html)
