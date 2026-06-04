# 프로젝트 폴더 구조

## 전체 구조

```
src/
├── app/                        # Next.js App Router (라우팅만)
│   ├── (auth)/
│   │   └── login/page.tsx
│   ├── (main)/
│   │   ├── layout.tsx
│   │   ├── home/page.tsx
│   │   ├── map/page.tsx
│   │   ├── calendar/page.tsx
│   │   ├── stories/
│   │   │   ├── page.tsx
│   │   │   ├── edit/page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── todo/
│   │   │   ├── page.tsx
│   │   │   └── create/page.tsx
│   │   ├── profile/
│   │   │   ├── page.tsx
│   │   │   ├── settings/page.tsx
│   │   │   └── privacy/page.tsx
│   │   └── anniversary/page.tsx
│   ├── auth/callback/page.tsx
│   ├── chat/page.tsx
│   └── workspace/
│       ├── landing/page.tsx
│       ├── setup/page.tsx
│       ├── edit/page.tsx
│       ├── list/page.tsx
│       └── join/[code]/page.tsx
│
├── features/                   # 도메인별 기능 모듈
│   ├── auth/
│   │   ├── api/auth.ts
│   │   ├── components/LoginView.tsx
│   │   ├── queries/authQueries.ts
│   │   └── stores/useAuthStore.ts
│   ├── anniversary/
│   │   └── components/AnniversaryView.tsx
│   ├── calendar/
│   │   ├── api/calendar.ts
│   │   ├── components/CalendarView.tsx
│   │   ├── queries/
│   │   ├── stores/useCalendarStore.ts
│   │   └── types/calendar.ts
│   ├── chat/
│   │   ├── components/
│   │   │   ├── ChatView.tsx
│   │   │   ├── ChatInput.tsx
│   │   │   └── MessageBubble.tsx
│   │   └── types/chat.ts
│   ├── home/
│   │   └── components/
│   │       ├── HomeView.tsx
│   │       ├── DDayHero.tsx
│   │       ├── MemoryCard.tsx
│   │       ├── MemoryFeed.tsx
│   │       ├── RecentCalendar.tsx
│   │       ├── RecentChat.tsx
│   │       └── RecentStories.tsx
│   ├── map/
│   │   ├── components/
│   │   │   ├── MapView.tsx
│   │   │   ├── GoogleMapView.tsx
│   │   │   ├── MapEmptyState.tsx
│   │   │   ├── MapPartnerInfo.tsx
│   │   │   ├── MapStoryInfo.tsx
│   │   │   ├── PathPickerMap.tsx
│   │   │   └── PathPreview.tsx
│   │   └── types/map.ts
│   ├── profile/
│   │   └── components/
│   │       ├── ProfileView.tsx
│   │       ├── SettingsView.tsx
│   │       └── PrivacyView.tsx
│   ├── stories/
│   │   ├── api/stories.ts
│   │   ├── components/
│   │   │   ├── StoriesView.tsx
│   │   │   ├── StoryDetailView.tsx
│   │   │   ├── StoryEditView.tsx
│   │   │   ├── StoryBriefInfo.tsx
│   │   │   └── StoryItem.tsx
│   │   ├── queries/
│   │   ├── stores/useStoryStore.ts
│   │   └── types/story.ts
│   ├── todo/
│   │   ├── api/todos.ts
│   │   ├── components/
│   │   │   ├── TodoView.tsx
│   │   │   ├── TodoCreateView.tsx
│   │   │   ├── TodoItem.tsx
│   │   │   └── TodoList.tsx
│   │   ├── queries/
│   │   ├── stores/useTodoStore.ts
│   │   └── types/todo.ts
│   └── workspace/
│       ├── api/workspaces.ts
│       ├── components/
│       │   ├── WorkspaceLandingView.tsx
│       │   ├── WorkspaceSetupView.tsx
│       │   ├── WorkspaceEditView.tsx
│       │   ├── WorkspaceListView.tsx
│       │   └── WorkspaceJoinView.tsx
│       ├── queries/
│       ├── stores/useWorkspaceStore.ts
│       └── types/workspace.ts
│
├── components/                 # 공용 UI 컴포넌트
│   └── common/
│       ├── AppHeader.tsx
│       ├── BottomDrawer.tsx
│       ├── BottomNav.tsx
│       ├── Card.tsx
│       ├── Checkbox.tsx
│       ├── Modal.tsx
│       ├── ProfileImage.tsx
│       └── Toast.tsx
│
├── lib/                        # 인프라 / 공용 설정
│   ├── api/storage.ts          # 여러 feature에서 쓰는 공용 API
│   ├── axios.ts
│   ├── QueryProvider.tsx
│   ├── SessionProvider.tsx
│   └── supabase.ts
│
├── stores/                     # 공용 전역 상태 (도메인 무관)
│   ├── useModalStore.ts
│   └── useToastStore.ts
│
├── hooks/                      # 공용 훅
│   └── useQueryParams.ts
│
├── types/                      # 공용 타입
│   ├── modal.ts
│   ├── toast.ts
│   └── user.ts
│
├── constants/                  # 전역 상수
│   ├── config.ts
│   ├── mockData.ts
│   └── theme.ts
│
├── utils/                      # 순수 유틸 함수
│   ├── date.ts
│   └── format.ts
│
├── assets/                     # 정적 자산
│   └── icons/
│
└── styles/                     # 전역 스타일
    ├── globals.scss
    └── _mixins.scss
```

---

## 네이밍 규칙

| 대상 | 규칙 | 예시 |
|---|---|---|
| 폴더 | camelCase | `components/`, `useQueryParams/` |
| 컴포넌트 파일 | PascalCase | `HomeView.tsx`, `DDayHero.tsx` |
| 스타일 파일 | PascalCase (컴포넌트와 동일) | `HomeView.module.scss` |
| 훅 파일 | camelCase | `useQueryParams.ts` |
| 타입/상수 파일 | camelCase | `calendar.ts`, `config.ts` |
| 상수 값 | UPPER_SNAKE_CASE | `APP_WORKSPACE`, `MOCK_DATA` |
| Next.js 특수 파일 | 소문자 예외 | `page.tsx`, `layout.tsx` |

---

## 새 파일 추가 기준

### 컴포넌트를 어디에 둘까?

```
여러 feature에서 재사용? ──Yes──▶ components/common/
           │
          No
           │
           ▼
     특정 feature 전용
           │
    페이지 전체를 담당? ──Yes──▶ features/[domain]/components/XxxView.tsx
           │
          No
           │
           ▼
    features/[domain]/components/XxxComponent.tsx
```

### 훅을 어디에 둘까?

```
도메인 무관 범용 훅 ──▶ hooks/
특정 도메인, 여러 라우트 ──▶ hooks/[domain]/
단일 라우트 전용 ──▶ features/[domain]/_hooks/  (또는 components/ 내 동일 위치)
```

### API를 어디에 둘까?

```
여러 feature에서 호출 (auth, storage 등) ──▶ lib/api/
특정 도메인 전용 ──▶ features/[domain]/api/
```

### Store를 어디에 둘까?

```
도메인 무관 (modal, toast) ──▶ stores/
특정 도메인 ──▶ features/[domain]/stores/
```

---

## View 패턴

`app/` 하위 `page.tsx`는 라우트 진입점만 담당합니다. 실제 UI와 로직은 `features/` 안의 View 컴포넌트에 작성합니다.

```tsx
// app/(main)/home/page.tsx — 항상 이 형태 유지
import { HomeView } from "@/features/home/components/HomeView";

export default function Page() {
  return <HomeView />;
}
```

`useSearchParams` 등 Next.js Suspense가 필요한 경우:

```tsx
import { Suspense } from "react";
import { StoriesView } from "@/features/stories/components/StoriesView";

export default function Page() {
  return <Suspense><StoriesView /></Suspense>;
}
```
