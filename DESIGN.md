# Design

## Source of truth
- Status: Active
- Last refreshed: 2026-08-13
- Primary product surfaces: 홈, 글 상세, 카테고리/태그 필터, 전체 검색, Projects, About, 404
- Evidence reviewed: `C:\Users\user\Downloads\yejilog 리뉴얼 데모.html`, `.omx/artifacts/visual-ralph/renewal-demo-1/reference-*.png`, 최신 로컬 화면 캡처 `review-current-*.png`, `app/globals.css`, `app/**`, `components/**`

## Brand
- Personality: 차분한 개인 개발 기록, 절제된 터미널 감성, 따뜻한 종이 질감
- Trust signals: 실제 글 날짜와 분류, 검색 가능한 본문, GitHub 프로젝트 상태, 읽기 쉬운 글 상세
- Avoid: 과도한 장식, 강한 그림자, 장난감 같은 개발자 테마, 콘텐츠를 방해하는 애니메이션

## Product goals
- Goals: 최신 글을 빠르게 찾고, 긴 기술 글을 편안하게 읽고, 작성자의 관심사와 프로젝트를 자연스럽게 이해하게 한다.
- Non-goals: 소셜 피드, 계정 기능, 관리자 UI를 공개 화면에 노출하는 것
- Success signals: 390px 모바일에서도 검색과 필터를 사용할 수 있고, 페이지 가로 스크롤이 생기지 않으며, 글 제목과 본문이 Sans로 선명하게 읽힌다. 긴 목차에서도 현재 항목이 항상 탐색 영역 안에 보인다.

## Personas and jobs
- Primary personas: 기술 문제의 해결 기록을 찾는 개발자, 작성자의 프로젝트를 살펴보는 방문자
- User jobs: 글 검색, 카테고리/태그 탐색, 목록 끝에서 5개씩 자동으로 이어 보는 무한 스크롤, 본문 정독, 관련 글 이동, 프로젝트/프로필 확인
- Key contexts of use: 데스크톱 집중 읽기, 모바일 검색과 빠른 참조

## Information architecture
- Primary navigation: Posts, Projects, About, Search. 카테고리와 태그 필터는 Posts 안에 둔다.
- Core routes/screens: `/`, `/posts/[...slug]`, `/projects`, `/about`, 404, `/rss.xml`
- Content hierarchy: 홈은 소개 → 필터 → 글 목록, 글 상세는 태그 → 제목 → 메타 → 본문 → 목차/이전·다음 글 순서로 구성한다. 제목 아래 미리보기 문장은 반복 노출하지 않는다. About은 프로필 사진과 소개, 터미널 패널 안의 기술 스택 그룹에 집중하며 별도 타임라인은 두지 않는다. Projects와 About은 독립 화면으로 구성한다.

## Design principles
- 기록과 글을 장식보다 먼저 보이게 한다.
- 읽는 텍스트는 IBM Plex Sans KR, 명령·상태·메타 정보는 IBM Plex Mono를 사용한다.
- 레퍼런스의 시각 언어를 유지하되, 잘림·가로 넘침·숨은 핵심 조작은 그대로 복제하지 않는다.
- 단축키 표기는 방문자의 운영체제를 따른다: macOS/iOS는 `⌘K`, Windows/Linux는 `Ctrl K`.
- 코드블록의 줄 번호와 코드 행 매칭 구조는 유지한다.

## Visual language
- Color: 따뜻한 아이보리/올리브 블랙 기반, amber `#ffd64d`는 활성·진행·강조에 제한적으로 사용
- Typography: 한국어는 Pretendard Variable 400–700, 영문 읽기 텍스트는 IBM Plex Sans KR, 영문·숫자·코드는 IBM Plex Mono 400–600. 작은 한국어는 Pretendard 폴백으로 획 선명도를 유지한다.
- Spacing/layout rhythm: 4px 기반, 940px 외곽 폭, 데스크톱 28px/모바일 18px 거터
- Shape/radius/elevation: 5–12px 반경, 1px 경계, 모달과 터미널에만 뚜렷한 그림자
- Motion: 120–450ms. `prefers-reduced-motion`에서는 제거
- Imagery/iconography: 실제 이미지는 최소화하고 기능 아이콘만 사용

## Components
- Existing components to reuse: Header, SearchProvider, CategorySection, TagSection, PostList, ProjectsSection, PostTableOfContents, CodeBlock
- New/changed components: 검색 트리거는 검색 아이콘·레이블·운영체제별 키 배지를 한 컨트롤로 묶고, 모바일에서는 아이콘 버튼으로 축약한다. 그 외에는 새 계층 추가 없이 기존 CSS와 컴포넌트 경계를 보완한다.
- Variants and states: light/dark, active filter, empty/error/loading, desktop/mobile TOC
- Token/component ownership: 전역 색상·간격·타이포는 `app/globals.css`, 검색 전용 표현은 `SearchProvider.module.css`

## Accessibility
- Target standard: WCAG 2.2 AA
- Keyboard/focus behavior: skip link, 가시적 focus ring, 모달 focus trap·Escape·focus restore. 검색과 태그 모달은 하나의 dialog owner를 공유해 동시에 열리지 않으며 어느 모달이든 열리면 배경 스크롤을 잠근다.
- Contrast/readability: 본문과 제목은 Sans, Mono는 짧은 메타에 한정하며 amber는 작은 본문색으로 남용하지 않는다. 한국어 본문은 Pretendard로 또렷하게 표시하되 홈의 이름 강조는 IBM Plex Sans KR의 인상을 유지한다. 인용 블록은 첫·마지막 문단 여백을 제거해 위아래 내부 여백을 동일하게 보인다.
- Screen-reader semantics: landmark와 nav label, 상태 메시지, 실제 button/link 의미를 유지한다.
- Reduced motion and sensory considerations: 타이핑·모달·진행 애니메이션을 축소한다.

## Responsive behavior
- Supported breakpoints/devices: 360px 이상 모바일, 태블릿, 1000px 전후 데스크톱
- Layout adaptations: 모바일 헤더는 로고/액션과 내비게이션을 두 행으로 분리하고, 검색과 테마 버튼은 항상 뷰포트 안에 둔다. 카테고리는 숨은 가로 스크롤 없이 컨테이너 안에서 여러 줄로 펼쳐 전체 항목을 노출한다. 글 상세는 데스크톱 본문을 약 680px까지 활용하고, 목차는 뷰포트 안에서 독립 스크롤하며 활성 항목을 자동으로 따라간다.
- Touch/hover differences: 모바일 핵심 조작은 최소 40px 터치 영역을 확보하고 hover 없이도 상태를 이해할 수 있게 한다.

## Interaction states
- Loading: 검색 인덱스와 프로젝트 로딩 상태를 텍스트로 표시
- Empty: 필터와 검색 결과가 없을 때 다음 행동을 안내
- Error: 검색/프로젝트 실패 시 기본 링크와 로컬 대체 데이터를 제공
- Comments: 기존 글은 pathname 매핑을 유지하고, GitHub 검색 한도를 넘는 긴 인코딩 경로만 title 매핑으로 전환한다.
- Success: 선택된 필터를 목록 상단과 ARIA 상태로 함께 표시
- Disabled: 결과가 0인 태그 조합은 비활성화하고 대비를 낮춘다.
- Offline/slow network, if applicable: 정적 글은 유지하고 GitHub 데이터는 저장소 링크/대체 카드로 폴백한다.

## Content voice
- Tone: 짧고 담백한 한국어. 명령어 표현은 보조 장치로만 사용
- Terminology: 검색, 태그 선택, 초기화, 적용하기, 목록으로
- Microcopy rules: 행동을 먼저 쓰고 상태나 개수를 뒤에 붙인다. 영문은 기술명과 섹션 레이블에 한정한다.

## Implementation constraints
- Framework/styling system: Next.js App Router, React 19, 전역 CSS + 검색 CSS module
- Design-token constraints: 기존 CSS 변수와 컴포넌트를 확장하고 별도 디자인 시스템 계층은 만들지 않는다.
- Performance constraints: 검색 본문 인덱스는 모달을 열기 전까지 전송하지 않는다.
- Compatibility constraints: 서버와 첫 클라이언트 렌더의 테마가 일치해야 하며 Utterances 댓글 iframe도 사이트의 현재 라이트·다크 테마 변경을 즉시 따라간다.
- Test/screenshot expectations: ESLint, TypeScript, 테스트, production build, 1440×1000 및 390×844 화면 확인

## Open questions
- [ ] 실제 공개 이메일과 프로필 이미지 확정 / owner: site owner / impact: About 신뢰도
