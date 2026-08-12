# Design

## Source of truth
- Status: Active
- Last refreshed: 2026-08-12
- Primary product surfaces: home, post detail, tag filter, global search, projects, about, 404
- Evidence reviewed: `C:\Users\user\AppData\Local\Temp\yejilog-renewal.dc.html`, `app/globals.css`, `app/page.tsx`, `app/posts/[...slug]/page.tsx`, `components/**`, `public/profile.jpg`

## Brand
- Personality: 차분한 개발 기록, 작은 유머, 터미널에서 가져온 기술적 질감
- Trust signals: 실제 게시 날짜와 분류, 원문 검색, GitHub 프로젝트 상태, 읽기 쉬운 본문
- Avoid: 과도한 네온, 장식적인 글꼴, 큰 그림자, 둥근 알약 UI의 남용, 의미 없는 애니메이션

## Product goals
- Goals: 최신 글을 빠르게 찾고, 긴 글을 편하게 읽고, 작성자의 관심사와 작업을 자연스럽게 이해하게 한다.
- Non-goals: 소셜 피드, 복잡한 계정 기능, 관리 화면을 공개 화면에 노출하는 것
- Success signals: 모바일에서도 핵심 내비게이션과 검색에 접근 가능, 필터 결과가 예측 가능, 긴 글에서 현재 위치를 잃지 않음

## Personas and jobs
- Primary personas: 기술 문제의 해결 기록을 찾는 개발자, 작성자의 프로젝트를 살펴보는 방문자
- User jobs: 글 검색, 카테고리/태그 조합 탐색, 본문 훑어보기, 관련 글 이동, 프로젝트/프로필 확인
- Key contexts of use: 데스크톱 집중 읽기, 모바일 검색 및 빠른 참조

## Information architecture
- Primary navigation: Posts, Filter, Projects, About, Search
- Core routes/screens: `/`, `/posts/[...slug]`, `/not-found`, `/rss.xml`
- Content hierarchy: 소개 → 필터 → 글 → 프로젝트 → 작성자; 글 화면은 메타 → 목차 → 본문 → 이전/다음 → 댓글

## Design principles
- 기록이 장식보다 먼저 보이게 한다.
- Sans KR은 읽기, Mono는 상태·명령·메타 정보에만 사용한다.
- Tradeoffs: 화면 밀도는 유지하되 모바일에서 가로 탐색을 허용해 긴 목록의 높이를 줄인다.

## Visual language
- Color: 올리브 블랙/아이보리 기반, lime은 활성·진행, yolk는 보조 강조에만 사용
- Typography: IBM Plex Sans KR 300–700, IBM Plex Mono 400–600
- Spacing/layout rhythm: 4px 기반, 주요 섹션 44–72px, 본문 최대 760px
- Shape/radius/elevation: 4–14px 반경, 1px 경계, 모달 외에는 강한 그림자 금지
- Motion: 120–300ms; `prefers-reduced-motion`에서 제거
- Imagery/iconography: 실제 프로필 이미지와 작은 기능 아이콘만 사용

## Components
- Existing components to reuse: Header, SearchProvider, TagSection, PostList, ProjectsSection, PostTableOfContents
- New/changed components: ReadingProgress, 모바일 헤더 레이아웃, RSS 링크/피드
- Variants and states: light/dark/auto, active filter, empty/error/loading, desktop/mobile TOC
- Token/component ownership: 전역 색상·간격·타이포는 `app/globals.css`; 검색 전용 표현은 CSS module

## Accessibility
- Target standard: WCAG 2.2 AA를 목표로 함
- Keyboard/focus behavior: skip link, 가시적 focus ring, 모달 focus trap·Escape·focus restore
- Contrast/readability: 본문과 메타 색을 분리하고 lime은 큰 텍스트나 경계/상태에 사용
- Screen-reader semantics: landmark와 nav label, 상태 메시지, 장식 요소 숨김
- Reduced motion and sensory considerations: 타이핑·모달·진행 애니메이션 축소

## Responsive behavior
- Supported breakpoints/devices: 360px 이상 모바일, 태블릿, 1000px 전후 데스크톱
- Layout adaptations: 모바일 헤더는 2행, 내비게이션은 가로 스크롤, 글 목차는 접이식, 프로젝트/About는 1열
- Touch/hover differences: 터치 목표 최소 40px에 가깝게 확보, hover만으로 정보를 숨기지 않음

## Interaction states
- Loading: 검색 인덱스와 프로젝트 로딩/대체 상태를 텍스트로 표시
- Empty: 필터와 검색에서 다음 행동을 안내
- Error: 검색/프로젝트 실패 시 기능을 닫거나 원본 링크로 이동 가능
- Success: 선택된 필터와 현재 목차 항목을 시각·ARIA로 함께 표시
- Disabled: 결과가 0인 태그 조합은 비활성화하고 대비를 낮춤
- Offline/slow network, if applicable: 정적 글은 유지하고 GitHub 데이터는 저장소 링크 카드로 대체

## Content voice
- Tone: 짧고 담백한 한국어, 개발 명령어 메타포는 보조적으로만 사용
- Terminology: 검색, 태그 선택, 초기화, 적용하기, 목록으로
- Microcopy rules: 행동을 먼저 쓰고 상태/개수를 뒤에 붙인다. 영문은 기술명과 섹션 레이블에 한정한다.

## Implementation constraints
- Framework/styling system: Next.js App Router, React 19, 전역 CSS + 검색 CSS module
- Design-token constraints: 기존 CSS 변수 확장, 별도 디자인 시스템 의존성 추가 금지
- Performance constraints: 검색 본문 인덱스는 모달 첫 열기 전까지 전송하지 않음
- Compatibility constraints: 서버 렌더 결과와 첫 클라이언트 렌더가 동일해야 함
- Test/screenshot expectations: 유틸 테스트, typecheck, ESLint, production build; 브라우저 연결 시 390×844와 1440×1000 시각 확인

## Open questions
- [ ] 실제 공개용 이메일 주소와 소개 문구 확정 / owner: site owner / impact: About 신뢰도
- [ ] 브라우저 자동화 연결 후 시안 대비 스크린샷 점수 기록 / owner: implementation / impact: 최종 시각 검증
