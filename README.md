# 📚 개인 Blog 프로젝트

이 리포지토리는 **Next.js**와 **MDX** 기반의 개인 블로그입니다. Markdown 파일로 포스트를 작성하며, 다양한 UI 기능과 개발 편의성을 제공합니다.

---

## ✨ 주요 기능

- 📰 **MDX/Markdown 지원**: `posts` 디렉터리에 `.md` 또는 `.mdx` 파일 추가
- 🔄 **동적 라우팅**: `[...slug]/page.tsx`에서 슬러그 기반 페이지 생성
- 💡 **코드 하이라이트**: `react-syntax-highlighter` + `highlight.js`, `rehype-highlight`
- 🌙 **다크 모드**: `DarkModeToggle` 컴포넌트로 모드 전환
- 💬 **댓글 시스템**: GitHub 이슈 기반 `UtterancesComments`
- 🏷️ **태그/카테고리**: `blog.config.ts`에서 설정 가능

---

## 📁 디렉토리 구조

```text
📦 blog
├─ app
│  ├─ layout.tsx        # 전역 레이아웃
│  ├─ page.tsx          # 홈 페이지
│  └─ posts
│     └─ [...slug]
│        └─ page.tsx    # 포스트 페이지
├─ components           # UI 재사용 컴포넌트
├─ scripts              # 포스트 생성 · 메타데이터 스크립트
├─ public               # 이미지 · 폰트 · 정적 자원
├─ utils                # 유틸 함수 (포맷터, 슬러그 등)
├─ blog.config.ts       # 블로그 설정 (작성자, 소셜 링크 등)
├─ next.config.ts       # Next.js 설정
└─ package.json         # 의존성 · 스크립트 정의
```

---

## 🚀 설치 및 실행

```bash
# 1. 클론 & 이동
git clone https://github.com/your-username/blog.git
cd blog

# 2. 의존성 설치
npm install

# 3. 개발 서버 실행
npm run dev
# ➡️ http://localhost:3000
```

> **프로덕션 빌드 & 실행**
>
> ```bash
> npm run build
> npm start
> ```

---

## ⚙️ 주요 스크립트

| ⚙️ 명령어          | 📝 설명                                 |
| ------------------ | --------------------------------------- |
| `npm run dev`      | 개발 서버 (turbopack)                   |
| `npm run build`    | 프로덕션 빌드                           |
| `npm start`        | 빌드된 앱 실행                          |
| `npm run lint`     | ESLint 검사                             |
| `npm run post`     | 새 포스트 생성 (`create-post.js`)       |
| `npm run prebuild` | 메타데이터 갱신 (`generatePosts.cjs`)   |
| `npm run generate` | `ts-node scripts/generatePosts.ts` 실행 |

---

## 🛠️ 기술 스택

- **Framework**: Next.js 15.3.2
- **Language**: TypeScript, React 19
- **스타일링**: Tailwind CSS (+ typography 플러그인)
- **MDX 처리**: next-mdx-remote, remark, rehype
- **코드 하이라이트**: react-syntax-highlighter, highlight.js
- **댓글**: Utterances (GitHub 이슈)
- **유틸리티**: dayjs, gray-matter, slugify
