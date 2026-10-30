# ui 폴더 구조 (FSD + Next.js)

Next `app/`이 FSD의 app·pages 레이어 역할을 하고, 그 아래 레이어는 [Feature-Sliced Design](https://feature-sliced.design)을 따른다.

```
src/
├─ app/            Next 라우팅 + 앱 초기화 (FSD app·pages 역할)
│  ├─ layout.tsx
│  ├─ _providers/  QueryProvider 등
│  └─ (main)/stories/
│     ├─ page.tsx
│     └─ _components/   이 화면에서만 쓰는 컴포넌트
├─ widgets/        재사용되는 큰 블록 (app-header, bottom-nav)
├─ features/       재사용되는 행동   (logout, switch-workspace)
├─ entities/       비즈니스 개체     (viewer, workspace, story, todo, calendar-event, message, profile)
└─ shared/         도메인 무관 코드  (ui, api, lib, config, routes, styles)
```

슬라이스 내부는 역할별 세그먼트로 나눈다.

```
entities/story/
├─ ui/         StoryCard.tsx, StoryCard.module.scss
├─ api/        storyQueries.ts
├─ model/      types.ts, 스토어
├─ lib/        내부 헬퍼
└─ index.ts    외부 공개 대상만 export
```

## 규칙

- 위 레이어만 아래 레이어를 import한다. 같은 레이어의 다른 슬라이스는 import하지 않는다.
- 외부에서는 슬라이스의 `index.ts`로만 import한다. 서버 전용 코드는 `index.server.ts`로 노출한다.
- 화면 전용 코드는 라우트 폴더의 `_components/`에 두고, 두 곳 이상에서 쓰일 때 아래 레이어로 내린다.
- 같은 레이어끼리 필요하면 위에서 조합하거나 props로 주입한다.
- entity 이름은 백엔드 도메인을 따른다(`api/structure.md`).
