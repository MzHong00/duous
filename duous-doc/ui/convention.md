# ui 컨벤션 (Next.js)

`common/convention.md`에 더해 duous-ui에만 적용한다.

## 공통 규칙

### 원칙

- UX·접근성을 함께 고려한다.

### 구조

- 각 세그먼트(ui, api, model, lib, config)는 자기 역할의 코드만 export한다.

### 작성 규칙

- 라우트는 하드코딩하지 않고 상수로 분리한다.
- any 대신 unknown과 타입 가드로 타입을 좁힌다.

### 비동기 처리

- 비동기 처리는 loading·error·empty 상태를 모두 다룬다.

## 프로젝트 규칙

### 구조

- 레이어·슬라이스·세그먼트 구조는 `ui/structure.md`(FSD)를 따른다.

### TanStack Query

- 쿼리는 `entities/[개체]/api/[개체]Queries.ts`(키 + `queryOptions`), 뮤테이션 훅은 쓰는 곳의 `api` 세그먼트에 둔다.
- `useQuery(storyQueries.list(workspaceId))`처럼 정의된 옵션으로 쓰고, 키 배열을 직접 쓰지 않는다.
- 키는 `all`에서 파생하는 계층으로 만들어 범위 단위로 무효화한다(예: `storyQueries.all() → lists() → list(id)`).

### Zustand

- 스토어는 `useXxxStore(selector)` 훅과 `xxxActions`를 export하고, 훅 안에 `useShallow`를 내장한다. 사용하는 쪽에서 다시 감싸지 않는다.
- 셀렉터로 필요한 값만 구독한다.

### 스타일

- 컴포넌트와 같은 폴더에 `[ComponentName].module.scss`를 둔다.
- 스타일은 CSS Modules로 쓴다. 인라인 `style`은 CSS 변수나 런타임 계산값을 넘길 때만 쓴다.
- 전역 스타일은 `app/`(루트 layout에서 import), 토큰·믹스인은 `shared/styles`에 둔다.
