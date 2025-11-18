# FRONTNEND_AGENT (Subway Time 프런트엔드)

이 문서는 Subway Time 프로젝트의 **프런트엔드 작업 가이드**입니다.  
이 파일 범위: 이 레포의 Next.js 앱(`app/`, `lib/`, `public/` 이하) 전체.

---

## 1. 목표

- PRD.md를 기준으로, **“지하철 타면 그냥 이 앱 켠다”**는 루틴을 만드는 모바일 웹 앱을 만든다.
- 1차 목표는 **MVP 수준의 학습팩 브라우저**를 빠르게 띄우는 것.
- 초기에는 **더미 데이터 & 수동 입력** 위주로 만들고, 이후 BFF/에이전트/외부 API를 점진적으로 붙인다.

---

## 2. 기술 스택

- 프레임워크 / 빌드: **Next.js (App Router)** + TypeScript
- 배포 타깃: **Vercel** (풀스택 한 번에)
- BFF: `app/api/*` 라우트 핸들러 (Next.js 서버 기능)
- PWA:
  - `public/manifest.json`
  - 이후 `next-pwa` 또는 커스텀 Service Worker로 캐싱 고도화
- UI 라이브러리: React
- 스타일: 전역 CSS(`app/globals.css`)로 시작 후, 필요 시 Tailwind 또는 CSS Modules 도입

---

## 3. UX / UI 기본 원칙

- **모바일 우선 (320~430px 기준)**  
  - 한 손 조작, 스크롤 위주.
- **홈 진입 즉시 ‘오늘의 학습팩’ 노출**
  - PRD 6.1: 앱을 열면 바로 오늘 기준 기본 학습팩 카드 리스트가 보이도록 설계.
- 카드 단위 UI
  - 학습팩 카드: 제목, 예상 소요 시간, 출처 아이콘(GeekNews / Docs / Notion 등)
  - 카드 클릭 시 상세 모달 또는 별도 섹션에서 내용 표시.
- 텍스트는 **짧게, 한글 위주**, 필요 시 원문 링크 제공.

---

## 4. 초기 화면 구조 (MVP)

- `/` (홈, `app/page.tsx`)
  - 헤더: 오늘 날짜 / 요일 / 기본 이동 시간 표시
  - 섹션: 이동 시간 설정 영역
    - 직접 입력 (10, 20, 30, 40분 등 슬라이더/버튼)
  - 섹션: 오늘의 학습팩 리스트
    - 더미 데이터 기반 3~5개의 카드
    - 각 카드: 타입(GeekNews / Docs / Notion), 제목, 예상 시간, 태그, “지금 보기” 버튼

> 1차 구현에서는 실제 GeekNews/Notion 연동 없이, 더미 데이터 + BFF 목 API로 흐름을 먼저 검증한다.

---

## 5. 상태 관리 전략 (초기)

- 전역 상태 관리 라이브러리 없이, React 컴포넌트 state와 Context로만 구성.
- 주요 상태:
  - `availableMinutes`: 오늘 사용 가능한 이동 시간 (사용자 입력값)
  - `learningPacks`: 추천된 학습팩 카드 리스트 (초기에는 하드코딩 or `/api/learning-packs` 응답)
  - `selectedPack`: 사용자 선택 카드 (모달/상세 보기 용)

이후 실제 에이전트/외부 API 연동이 붙으면, React Query 또는 서버 액션 / 서버 컴포넌트를 조합해 간단한 데이터 흐름을 만든다.

---

## 6. 컴포넌트 설계 (초기 초안)

- `app/layout.tsx`
  - 공통 HTML 구조, 메타데이터, PWA 관련 태그, 글로벌 스타일
- `app/page.tsx`
  - 전체 레이아웃, 헤더/콘텐츠 래핑, 클라이언트 상태
- `TimeSelector`
  - 이동 시간 입력/선택 UI (슬라이더 또는 버튼 그룹)
- `LearningPackList`
  - 학습팩 카드 리스트 렌더링
- `LearningPackCard`
  - 단일 카드 (타입, 제목, 태그, 시간, 버튼)
- `PackDetailModal` (또는 `PackDetailPanel`)
  - 카드 클릭 시 상세 내용 표시 (MVP 이후)

MVP는 `page.tsx` 안에서 `TimeSelector`, `LearningPackList`, `LearningPackCard` 정도까지만 구현해도 충분하다.

---

## 7. 개발 원칙

- PRD.md에 없는 기능은 **지금 당장은 만들지 않는다.**
- 실제 API 연동이 필요해지기 전까지는
  - 더미 데이터 / 목업을 사용해서 UX를 먼저 검증.
- CSS는 초기에는 한 파일(`app/globals.css`)에 모아두고,
  - 컴포넌트가 많아지면 점진적으로 분리한다.
- 타입스크립트:
  - 주요 도메인 모델(학습팩, 카드 등)은 `lib/`에 정의해 재사용.

---

## 8. 지금 바로 할 일 (FRONTNEND_AGENT TODO)

1. 루트에 Next.js(App Router) 기본 구조 유지
2. `app/layout.tsx` + `app/page.tsx` + `app/globals.css` 구성
3. `app/page.tsx`에서
   - 상단 헤더(오늘 날짜, 기본 시간)
   - 시간 입력(슬라이더 또는 버튼)
   - 더미 학습팩 카드 리스트 3~5개 렌더링
4. BFF 목 API (`app/api/learning-packs/route.ts`)를 만들고, 이후 실제 GeekNews/Notion/Docs 연동 시 이 라우트에서 조합

이 파일에 정의된 원칙을 위반해야 할 경우,  
반드시 이 문서를 먼저 업데이트한 뒤 작업한다.
