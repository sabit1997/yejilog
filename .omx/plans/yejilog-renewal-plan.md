# YEJILOG 리뉴얼 구현 계획

## 요구사항 요약

- 제공된 `yejilog-renewal.dc.html`을 시각 기준으로 삼아 홈, 글 상세, 필터, 프로젝트, About, 검색, 404를 하나의 터미널풍 디자인 시스템으로 통일한다.
- 본문/한글 UI는 `IBM Plex Sans KR`, 코드·메타·내비게이션은 `IBM Plex Mono`로 교체한다.
- 기존 Markdown/MDX 글, URL 기반 카테고리·태그 필터, GitHub 프로젝트 카드, 댓글, 이전/다음 글 기능은 유지한다.
- 새 기능은 Auto/Light/Dark 테마, 개선된 태그 AND 필터, `Cmd/Ctrl+K` 통합 검색, 글 목차, About 섹션, 전용 404이다.

## 구현 변경

### 1. 디자인 토큰과 전역 레이아웃

- `app/layout.tsx`의 Instrument Serif/DM Sans/JetBrains Mono를 `next/font/google`의 IBM Plex Sans KR/IBM Plex Mono로 교체하고 CSS 변수 `--font-sans`, `--font-mono`만 공개한다.
- `app/globals.css`의 기존 색상 토큰을 시안의 `bg/card/term/fg/dim/line/accent` 체계로 정돈하고, 타이포그래피·간격·테두리·포커스·모션 토큰을 추가한다.
- 헤더를 로고, `POSTS/FILTER/PROJECTS/ABOUT`, 검색 버튼, 3단계 테마 선택기로 재구성한다. 모바일에서는 핵심 링크와 검색/테마 조작이 가려지지 않도록 축약형 내비게이션을 사용한다.
- footer의 연도는 런타임 현재 연도로 표시하고, 잘못 연결된 RSS 링크는 실제 RSS를 구현하지 않는 한 `sitemap.xml` 표기로 정정한다.
- `prefers-reduced-motion`에서는 히어로 타이핑과 커서 깜빡임을 정지하고 정적 첫 문장을 노출한다.

### 2. 홈 구조와 기존 데이터 기능 재배치

- `app/page.tsx`의 현재 데이터 흐름은 유지하되 시안 순서대로 Hero → Filter/Posts → Projects → About을 구성한다.
- Hero는 현재 타이핑 터미널을 유지하면서 시안 크기·문구·레이아웃에 맞춘다.
- 글 목록은 날짜/제목/카테고리/최대 3개 태그를 시안 행 구조로 표시하고, 현재 `limit` 기반 더 보기를 유지한다. 필터 변경 시 `limit`을 초기화한다.
- 프로젝트는 기존 GitHub API 및 1시간 재검증을 유지한다. API 실패 시 섹션 전체를 숨기지 않고 설정 파일의 저장소명과 GitHub 링크를 사용한 최소 fallback 카드를 표시한다.
- About 콘텐츠(프로필 이미지, GitHub·이메일, 소개, 기술 스택, 연도별 타임라인)는 `blog.config.ts`의 명시적 설정 데이터로 이동하고 홈의 `#about` 앵커에 렌더링한다.

### 3. 태그 필터 개선

- 태그 패널에 검색 입력, 사용 빈도 상위 6개 태그, 나머지 태그의 고정 높이 스크롤 목록, 태그별 현재 조건 기준 결과 수를 추가한다.
- 다중 태그 조건을 현재 OR에서 AND로 변경한다. 카테고리와 이미 선택한 태그를 함께 적용했을 때 결과가 0개인 후보 태그는 비활성화한다.
- 패널 내부 선택은 임시 상태로 두고 `적용하기`에서만 URL의 `tags`를 갱신한다. 초기화, 개별 제거, 배경 클릭, Escape 닫기, 포커스 복귀를 지원한다.
- 선택 태그는 URL query를 단일 source of truth로 유지하여 새로고침·뒤로가기·링크 공유 결과가 동일하게 한다.

### 4. 통합 검색 모달

- 전역 client provider를 두고 헤더 검색 버튼 또는 macOS `Cmd+K`/Windows·Linux `Ctrl+K`로 모달을 연다. Escape로 닫고 포커스를 트랩하며 닫힌 뒤 트리거로 복귀한다.
- 빌드 시 생성되는 `public/posts.json`에 Markdown에서 코드 블록·마크업을 제거한 검색용 `excerpt/searchText`를 추가한다. 공개 글만 포함하고 제목·태그·카테고리·본문을 대소문자 구분 없이 검색한다.
- 결과는 Posts와 Tags 두 그룹으로 표시한다. 키보드 위/아래 이동, Enter 열기, 일치 문자열 강조, 결과 없음 상태를 제공한다.
- 검색 인덱스는 모달 최초 오픈 시 한 번만 불러오고, 별도 검색 서비스나 신규 의존성 없이 현재 글 규모에 맞는 클라이언트 필터링을 사용한다.

### 5. 글 상세와 TOC

- `utils/posts.ts`에서 Markdown의 h1~h3를 안정적인 slug/id와 함께 추출하고 글 데이터에 목차를 포함한다. 중복 제목에는 순번 suffix를 붙이고 코드 블록 안의 `#`는 제외한다.
- `components/markdown/MarkdownComponents.tsx`의 heading renderer에도 동일한 ID 규칙을 적용해 목차 링크와 본문 앵커가 일치하도록 한다.
- 데스크톱 글 상세는 본문 + sticky TOC 2열, 작은 화면은 본문 상단 접이식 목차로 전환한다. 현재 MDX, 코드 복사, 댓글, 이전/다음 글은 유지한다.
- TOC 클릭은 해당 heading으로 이동하며 sticky header 높이를 `scroll-margin-top`으로 보정한다. 현재 섹션 강조는 IntersectionObserver 기반 progressive enhancement로 구현한다.

### 6. 테마와 오류 화면

- 테마 값은 `auto | light | dark`로 정의하고 localStorage에 저장한다. `auto`는 OS 설정을 따르며 실행 중 미디어 쿼리 변경도 반영한다.
- 초기 inline script가 저장값과 OS 값을 먼저 해석해 hydration 전 `data-theme`을 설정하도록 하여 테마 번쩍임을 방지한다.
- `app/not-found.tsx`를 추가해 시안의 terminal `command not found` 화면, 홈 이동, 검색 열기 동작을 제공한다.
- 모든 모달/버튼/링크에 명확한 label, focus-visible, 키보드 조작, 충분한 색 대비를 적용한다.

## 공개 인터페이스와 데이터 변경

- `Post`에 `excerpt: string`과 `searchText: string`을 추가하고 `scripts/generatePosts.cjs`가 두 값을 생성한다.
- `blog.config.ts`에 `profile.email`, `profile.image`, `profile.stack`, `profile.timeline`을 추가한다. About의 문구와 목록은 컴포넌트에 하드코딩하지 않는다.
- 테마 저장 키 `theme`의 값은 기존 `light | dark`와 호환되는 `auto | light | dark`로 확장한다.
- 홈 query 계약은 `category`, 쉼표 구분 `tags`, `limit`을 유지하며 태그 의미만 OR에서 AND로 변경한다.
- 검색은 별도 route/API 없이 정적 `/posts.json`을 사용하며 공개 포스트만 노출한다.

## 테스트 및 검증

- 순수 유틸 단위 테스트를 추가해 태그 AND 조합, 0건 후보 계산, 검색 정규화/정렬, heading slug 중복 처리, excerpt 생성, 테마 해석을 검증한다.
- 컴포넌트 테스트로 태그 패널의 적용/초기화/Escape, 검색 모달의 단축키·키보드 이동·결과 열기, 테마 3단계, 모바일 TOC 토글을 검증한다.
- 통합 시나리오: 카테고리+복수 태그 URL을 새로고침해 같은 결과가 나오는지, 검색 결과에서 한글 slug 글로 이동하는지, 목차 링크와 실제 heading ID가 일치하는지 확인한다.
- 접근성 시나리오: 검색/태그 모달 포커스 트랩과 복귀, 키보드만으로 전체 조작, reduced-motion, light/dark 대비를 확인한다.
- 회귀 검증: `npm run validate:posts`, 새 테스트 명령, ESLint 직접 실행, `npm run build`를 순서대로 통과시키고 홈·글 상세·존재하지 않는 URL을 데스크톱/모바일 및 light/dark/auto에서 시안과 육안 비교한다.

## 수용 기준

- 홈에 `#posts`, `#projects`, `#about` 앵커가 존재하고 헤더 링크가 정확히 이동한다.
- IBM Plex Sans KR/Mono만 역할별 전역 폰트로 적용되며 한글·영문·코드 fallback이 깨지지 않는다.
- 복수 태그 선택 결과는 모든 선택 태그를 포함하며, 현재 조건에서 0건인 후보는 선택할 수 없다.
- `Cmd/Ctrl+K` 검색이 제목·태그·본문에서 공개 글을 찾고 마우스 없이 결과를 열 수 있다.
- h1~h3가 있는 글은 TOC 항목과 본문 ID가 1:1로 일치하고, heading이 없는 글도 오류 없이 렌더링된다.
- Auto 테마는 OS 변경을 즉시 반영하고 명시적 Light/Dark 선택은 OS 변경보다 우선한다.
- GitHub API 실패, 검색 결과 없음, 필터 결과 없음, 잘못된 URL에서 각각 의도된 fallback UI가 보인다.
- 360px 모바일부터 데스크톱까지 가로 스크롤이 없고 주요 조작에 키보드 focus-visible이 표시된다.

## 위험과 완화

- 본문 전체를 검색 인덱스에 넣으면 JSON이 커질 수 있으므로 마크업을 제거한 정규화 텍스트를 사용하고 실제 빌드 산출물 크기를 확인한다.
- heading 파서와 MDX renderer의 slug 규칙이 어긋날 수 있으므로 하나의 공유 유틸만 사용하고 중복/한글/기호 제목 fixture로 고정한다.
- Google font 빌드가 네트워크에 의존할 수 있으므로 구현 시 IBM Plex 파일 self-hosting 가능 여부를 확인하고, CI가 오프라인이면 로컬 폰트 파일로 전환한다.
- 기존 작업 트리에 포스트 파일명 변경과 `public/posts.json` 수정이 있으므로 이를 덮어쓰지 않고 생성 결과 diff를 별도로 검토한다.

## 가정

- 제공 HTML은 픽셀 단위 복제 대상이 아니라 구조·시각 언어·상호작용의 기준이다.
- 검색은 현재 43개 공개 글 규모에 맞춘 클라이언트 검색이며 fuzzy search와 외부 검색 서비스는 범위 밖이다.
- About의 이메일·스택·타임라인 문구는 시안 값을 초기값으로 사용하되 `blog.config.ts`에서 쉽게 수정 가능하게 한다.
- RSS 신규 구현과 관리자 CMS는 이번 범위에 포함하지 않는다.
