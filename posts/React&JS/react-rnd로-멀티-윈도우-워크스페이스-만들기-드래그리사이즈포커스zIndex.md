---
title: react-rnd로 멀티 윈도우 워크스페이스 만들기 (드래그/리사이즈/포커스/zIndex)
date: 2025-06-17 21:39:08
category: "Nextjs"
isPrivate: false
tags: ["React", "Next.js", "react-rnd", "Zustand", "zIndex", "Drag", "Resize"]
---

## 서론

캠스터디 앱을 만들면서 “한 화면에서 여러 창을 자유롭게 배치하는” UX가 꼭 필요했다.  
웹캠/유튜브/화면공유/투두를 한 화면에 띄워놓고, 사용자가 **원하는 위치로 드래그**하고 **원하는 크기로 리사이즈**하는 느낌을 내고 싶었다.

1. 드래그 & 리사이즈
2. 위치/크기 상태 저장(새로고침해도 유지)
3. 클릭한 창이 제일 앞으로(포커스/레이어링)

이 글은 내가 실제 커밋으로 구현해 나간 흐름(삽질 포함)을 정리한 트러블슈팅 + 구현기다.

---

## 목표: “창을 창답게” 만들기

내가 원한 동작은 이런 거였다.

- 창을 드래그해서 옮길 수 있다.
- 창을 리사이즈할 수 있다. (가능하면 비율 고정)
- 창을 클릭하면 **그 창이 최상단으로 올라온다.**
- 새 창을 추가하면 기존 창들 위로 올라온다.
- 드래그/리사이즈한 결과가 상태로 저장된다.

---

## 1) react-rnd로 드래그/리사이즈 뼈대 만들기

결론부터 말하면 `react-rnd`를 썼다.  
드래그(`react-draggable`) + 리사이즈(`re-resizable`)를 합친 느낌이라 “창 UI” 만들기 편했다.

내 첫 구현은 이런 형태였다.

- `Rnd`로 감싼다
- 비율은 `lockAspectRatio`로 고정
- 화면 밖으로 못 나가게 `bounds="window"`
- 상단 바만 드래그 가능하게 `dragHandleClassName` 사용
- 드래그/리사이즈 시작 시 `bringToFront(id)` 호출해서 포커스 처리

```tsx
import { Rnd } from "react-rnd";
import WindowControlButton from "./circle-button";
import { useWindowStore } from "@/stores/window-state";

export default function AddWindow({ id, onOpenOption }) {
  const window = useWindowStore((s) => s.windows.find((w) => w.id === id));
  const bringToFront = useWindowStore((s) => s.bringToFront);

  if (!window) return null;
  const { type, zIndex } = window;

  return (
    <Rnd
      default={{ x: 100, y: 100, width: 320, height: 180 }}
      minWidth={240}
      minHeight={135}
      bounds="window"
      lockAspectRatio
      style={{ zIndex, position: "fixed" }}
      onDragStart={() => bringToFront(id)}
      onResizeStart={() => bringToFront(id)}
      dragHandleClassName="drag-handle"
    >
      <div className="w-full h-full border-2 rounded-2xl overflow-hidden bg-[#a0c878]">
        <div className="drag-handle flex gap-2 px-3 py-2 cursor-move bg-[#255f38]">
          <WindowControlButton
            type="close"
            onClick={() => {
              /* ... */
            }}
          />
          <WindowControlButton type="option" onClick={onOpenOption} />
        </div>

        <div className="w-full h-full">
          {/* camera / youtube / window-share ... */}
        </div>
      </div>
    </Rnd>
  );
}
```

여기까지 하면 “움직이긴 한다”…
근데 문제는 **새로고침하면 위치/크기가 날아간다**는 점이었다.

---

## 2) 위치/크기 저장: Uncontrolled -> Controlled로 바꾸기

`Rnd`는 `default`로 시작하는 “uncontrolled” 방식도 되지만,
나는 드래그/리사이즈 결과를 저장해야 했기 때문에 **position/size를 상태로 끌어올리는 controlled 방식**이 필요했다.

그래서 `window-state`에 아래 값을 넣었다.

- `x, y, width, height`
- `zIndex`

그리고 `Rnd`에는 `position / size`를 직접 꽂아주고,
`onDragStop / onResizeStop`에서 상태 업데이트하도록 바꿨다.

```tsx
<Rnd
  position={{ x, y }}
  size={{ width, height }}
  bounds="window"
  lockAspectRatio
  style={{ zIndex, position: "fixed" }}
  onDragStop={(e, d) => updateWindowBounds(id, d.x, d.y, width, height)}
  onResizeStop={(e, dir, ref, delta, position) => {
    updateWindowBounds(
      id,
      position.x,
      position.y,
      ref.offsetWidth,
      ref.offsetHeight
    );
  }}
/>
```

이렇게 바꾸니까:

- “지금 상태”가 store에 남고
- UI는 store를 그대로 반영하니까
- **새로고침/재실행에도 동일 레이아웃**을 만들 수 있는 길이 열렸다.

---

## 3) zIndex 관리: “최상단” 규칙을 상태로 만든다

처음엔 그냥 `z-index: 9999` 같은 꼼수도 떠올랐는데,
그건 “모든 창이 항상 최상단”이 되어버리므로 의미가 없었다.

내가 원한 건 이거다:

- 새로 추가한 창이 가장 위
- 클릭한 창이 가장 위
- 다른 창들은 유지

그래서 아주 단순한 정책으로 갔다.

- `bringToFront(id)`가 불리면
- 현재 windows 중 `maxZ`를 구해서
- 해당 창의 zIndex를 `maxZ + 1`로 올린다.

```ts
bringToFront: (id) =>
  set((state) => {
    const maxZ = Math.max(...state.windows.map((w) => w.zIndex || 0));
    return {
      windows: state.windows.map((w) =>
        w.id === id ? { ...w, zIndex: maxZ + 1 } : w
      ),
    };
  }),
```

그리고 포커스 트리거는 2군데에 걸었다.

- 드래그 시작할 때
- 리사이즈 시작할 때
- (추가로) 창 body 클릭했을 때도 포커스

```tsx
<div className="w-full h-full" onClick={() => bringToFront(id)}>
  ...
</div>
```

---

## 4) `zindex` vs `zIndex`… 네이밍 삽질로 하루 날림 😇

- 일부 코드는 `zindex` (백엔드 DTO 네이밍)
- 일부 코드는 `zIndex`

로 섞여 있었다.

결국 싹 정리했다:

- 타입: `Window.zIndex`
- DTO: `WindowPatchDto.zIndex`
- 서버 업데이트 payload도 `zIndex`
- 프론트 계산도 `zIndex`

```diff
- windows.map((w) => w.zindex)
+ windows.map((w) => w.zIndex)

- style={{ zIndex: zindex }}
+ style={{ zIndex: zIndex }}
```

---

## 5) 레이아웃: WindowZone은 “relative + overflow-hidden”이 정답이었다

처음엔 `flex flex-wrap`로 창들을 감쌌는데,
창이 늘어나면 레이아웃이 밀리고 “창이 창 같지 않은 느낌”이 강했다.

그래서 최종적으로는:

```tsx
<div className="relative w-full h-full overflow-hidden">{/* windows */}</div>
```

이렇게 “캔버스 같은 공간”을 만들고, 그 위에 창들이 떠다니게 구성했다.

---

## 결과

- 창을 드래그/리사이즈해서 원하는 배치를 만들 수 있다.
- 클릭한 창이 앞으로 올라온다(포커스/레이어링).
- 위치/크기 상태가 store로 저장되어 유지된다.
- `zIndex` 네이밍 통일로 삽질을 줄였다.

이제야 “진짜 창” 느낌이 났다… (감격 🥹)

---

## 느낀 점 / 개선할 점

- `bringToFront`가 매번 `maxZ`를 구하니 O(n)이다.
  창이 매우 많아지면 zIndex 카운터를 store에 따로 두는 게 더 낫겠다.
- zIndex는 결국 stacking context 규칙을 잘 알아야 삽질이 줄어든다.
  특히 position이 없는 요소엔 z-index가 의미 없어서
- `lockAspectRatio`는 UX가 좋았는데, “유튜브/웹캠/화면공유” 같이 16:9 콘텐츠에 특히 잘 맞았다.

---

## 📚 참고 링크

- [react-rnd (GitHub) — controlled position/size, dragHandle, bounds 등](https://github.com/bokuweb/react-rnd)
- [react-rnd (npm) — `lockAspectRatio` 옵션 설명](https://www.npmjs.com/package/react-rnd)
