# 아키텍처

## 레이어 구조

```
┌─────────────────────────────────┐
│           app/ (라우팅)          │  Next.js 라우트 진입점. UI 없음.
└────────────────┬────────────────┘
                 │ imports
                 ▼
┌─────────────────────────────────┐
│         features/ (도메인)       │  도메인별 View, 컴포넌트, 훅, 상태, API
└────────────────┬────────────────┘
                 │ imports
                 ▼
┌─────────────────────────────────┐
│     components/ lib/ stores/    │  도메인 무관 공용 자원
│     hooks/ types/ utils/        │
└─────────────────────────────────┘
```

**단방향 규칙:** 위 레이어는 아래만 참조합니다. 역방향 참조 금지.

- `app/` → `features/` → 공용 레이어 ✅
- 공용 레이어 → `features/` ❌
- `features/auth` → `features/workspace` ⚠️ (불가피한 경우 허용, 순환 금지)

---

## features/ 내부 구조

각 feature는 독립적인 도메인 모듈입니다. 내부 구조:

```
features/[domain]/
├── api/          # 서버 통신 (이 도메인 전용)
├── components/   # UI 컴포넌트 + View
├── queries/      # TanStack Query 키 & queryOptions
├── stores/       # Zustand 스토어
└── types/        # 타입 정의
```

필요한 것만 만듭니다. 모든 폴더가 반드시 있을 필요는 없습니다.

---

## 공용 vs 도메인 판단 기준

| 질문 | Yes | No |
|---|---|---|
| 2개 이상 feature에서 사용하는가? | 공용 레이어 | features/ 내부 |
| 도메인 개념을 담고 있는가? | features/ | 공용 레이어 |
| feature 삭제 시 같이 사라져야 하는가? | features/ 내부 | 공용 레이어 |

예외:
- `useModalStore`, `useToastStore` — 도메인 없음, 전역 UI 상태 → `stores/`
- `storage.ts`, `auth.ts` — 인프라 레이어, 여러 feature 의존 → `lib/api/`
- `user.ts` 타입 — 여러 feature에서 참조 → `types/`

---

## View 패턴

`page.tsx`는 Next.js 라우터와의 계약입니다. 비즈니스 로직이나 UI가 들어가면 테스트와 재사용이 어려워집니다.

```
page.tsx          역할: 라우트 등록, Suspense 경계
    │
    └── XxxView   역할: 전체 페이지 UI와 로직
            │
            └── 하위 컴포넌트들 (DDayHero, StoryItem 등)
```

View는 해당 라우트의 전체 화면을 담당하는 컴포넌트입니다. 재사용을 목적으로 만들지 않습니다.

---

## 상태 관리

| 상태 종류 | 위치 | 이유 |
|---|---|---|
| 서버 데이터 | TanStack Query (`queries/`) | 캐싱, 동기화 |
| 도메인 클라이언트 상태 | Zustand (`features/[domain]/stores/`) | 도메인 캡슐화 |
| 전역 UI 상태 (modal, toast) | Zustand (`stores/`) | 도메인 무관 |
| 컴포넌트 로컬 상태 | useState | 외부 불필요 |
| URL 상태 | useQueryParams | 공유·북마크 가능 |

---

## API 레이어

API 함수는 도메인 에러로 변환 후 throw합니다. 컴포넌트에서 직접 HTTP 에러를 처리하지 않습니다.

```
컴포넌트 → Query/Mutation → API 함수 → axios → 서버
                               ↑
                         에러 변환 책임
```

`lib/axios.ts`에 baseURL, 인터셉터, 공통 헤더를 설정합니다. 개별 API 파일에서 axios 설정을 직접 건드리지 않습니다.

---

## 의존성 규칙 요약

```
✅ 허용
  app/         → features/, components/, lib/, ...
  features/    → components/, lib/, stores/, hooks/, types/, utils/, constants/
  components/  → types/, utils/, constants/

❌ 금지
  components/  → features/
  lib/         → features/
  stores/      → features/
  순환 참조 (A → B → A)
```
