# 설계: 임시 백엔드 제거 + 목 전역스토어 → Supabase 실연동

> 아키텍처 확정: **Next.js ↔ Supabase 직접 통신** (별도 백엔드 없음).
> 범위 제외: 채팅(로컬 상태 유지), 지도 멤버 위치(실시간 presence 필요 — 별도 페이즈).

## 핵심 설계 원칙

1. **서버 상태와 클라이언트 상태의 분리가 이번 작업의 본질이다.**
   현재 `useWorkspaceStore`는 서버 데이터(워크스페이스 목록·멤버·초대)를 Zustand에 복제해서 로컬에서 변이한다. 이걸 TanStack Query(서버 상태)로 옮기고, Zustand에는 **순수 클라이언트 상태인 `currentWorkspaceId` 하나만** 남긴다. 목록·멤버는 항상 `workspaceQueries.mine()`이 단일 진실 공급원(SSOT).
2. **새로 만들지 말고 배선을 교체하라.** `workspacesApi`, `workspaceQueries`, `workspaceMutations`는 이미 존재한다. 컴포넌트가 `workspaceActions`(로컬 변이) 대신 기존 mutation을 호출하도록 바꾸는 것이 작업의 대부분이다.
3. **변이 후 상태 갱신은 전부 `invalidateQueries`로.** 로컬 setState로 낙관적 반영하지 않는다(요청되지 않은 복잡도).

---

## Phase 0 — 사전 확인 (구현 전 필수)

Supabase에 아래가 실재하는지 확인. 없으면 SQL로 생성 후 진행:

- 테이블: `workspaces`, `workspace_members`, `workspace_invites` (코드가 기대하는 컬럼은 `src/features/workspace/api/workspaces.ts`의 Row 인터페이스 참조)
- RLS: 본인이 멤버인 워크스페이스만 select/update, `workspace_invites`는 본인 이메일 대상 row select 가능해야 함
- Storage: `memories` 버킷 public (배경 이미지 업로드에 재사용)

✅ **초대 방식 결정: 초대 코드 방식으로 통일** (이메일 초대 폐기).
이유: 커플 앱 특성상 "카톡으로 코드 전달"이 자연스럽고, 이메일 방식은 OAuth 계정 이메일 불일치로 매칭 실패 위험 + RLS 복잡. `workspace_invites`는 `invite_code`·`expires_at` 컬럼 필요.
- 유지/사용: `getByInviteCode`, `join`, 신규 `createInviteCode`
- 삭제: `sendInvite`, `getPendingInvites`, `declineInvite`, `acceptInvite`(이메일 계열), `InvitationCard`, 스토어의 `invitations`

검증: Supabase 대시보드에서 각 테이블에 수동 insert → 앱 계정으로 select 되는지.

---

## Phase 1 — 임시 백엔드 코드 제거

**삭제:**
- `src/lib/api.ts` (importer 0개 확인됨 — 안전)
- `src/constants/config.ts`의 `API_URL` 항목과 `.env*`의 `NEXT_PUBLIC_API_URL`

**`useAuthStore` 슬림화:** `accessToken`/`refreshToken`은 임시 백엔드용이었다. Supabase가 세션을 자체 관리(cookie/localStorage)하므로 토큰 필드 제거.
- 사용처 점검: `SessionProvider.tsx`, `auth/callback/page.tsx`, `useProfileSettings.ts`, `LoginView.tsx`
- `isAuthenticated`가 라우팅 가드에 쓰이면 유지하되, 값의 출처를 Supabase 세션 이벤트(`onAuthStateChange`, SessionProvider에서)로 일원화. 아무 데도 안 쓰이면 스토어 자체 삭제.
- persist `version` 올리고 migrate로 구 필드 폐기.

검증: `npm run build` 통과 + 구글 로그인 → 홈 진입 → 새로고침 후 세션 유지.

---

## Phase 2 — 목 로그인 제거

`LoginView.tsx`:
- `handleMockLogin`, `MOCK_ACCESS_TOKEN`, `MOCK_DATA` import, `workspaceActions.initMockData()` 호출 제거
- 카카오 버튼: 삭제하지 말고 클릭 시 `toastActions.showToast("카카오 로그인은 준비 중이에요")` (UI 유지, 기능만 정직하게)

검증: 카카오 버튼 클릭 시 토스트만 뜨고 홈 진입 불가. 구글 로그인은 정상.

---

## Phase 3 — 워크스페이스 스토어 재설계 (이번 작업의 중심)

### 3-1. 스토어 축소

`useWorkspaceStore`를 아래만 남기고 재작성:

```ts
interface WorkspaceState {
  currentWorkspaceId: string | null; // 유일한 클라이언트 상태
}
// actions: setCurrentWorkspaceId(id | null), clearData()
```

- persist 유지(키 동일, version 올려서 migrate로 구조 폐기)
- 기존 쿠키 동기화 subscribe(SSR prefetch용)는 그대로 유지 — id만 보면 되므로 로직 변경 없음
- `workspaces`, `invitations` 배열과 `initMockData`, `createNewWorkspace`, `sendInvitation`, `respondToInvitation`, `removeWorkspace`, `updateWorkspace*`, `updateMemberProfile` 전부 삭제

### 3-2. 파생 훅 신설

`src/features/workspace/hooks/useCurrentWorkspace.ts`:

```ts
/** mine 쿼리 + currentWorkspaceId로 현재 워크스페이스를 파생 */
export const useCurrentWorkspace = () => {
  const id = useWorkspaceStore((s) => s.currentWorkspaceId);
  const { data: workspaces, ...rest } = useQuery(workspaceQueries.mine());
  const currentWorkspace = workspaces?.find((ws) => ws.id === id) ?? workspaces?.[0] ?? null;
  return { currentWorkspace, workspaces: workspaces ?? [], ...rest };
};
```

`?? workspaces?.[0]` 폴백: 저장된 id의 워크스페이스에서 탈퇴/삭제된 경우 자동 복구. `currentWorkspace`를 읽던 모든 컴포넌트(DDayHero, useAnniversaries, HomeView, MapView 등 — `useWorkspaceStore((s) => s.currentWorkspace)` 전수 검색)를 이 훅으로 교체.

### 3-3. API 보강 (부족한 것만)

`workspacesApi`에 추가:
- `leave(workspaceId, userId)`: `workspace_members`에서 본인 row delete. (워크스페이스 자체 삭제는 범위 외 — "나가기" 의미론으로 통일)
- `updateBackground(workspaceId, imageUrl)`: `workspaces.background_image` update

대응 mutation을 `workspaceMutations.ts`에 추가, `onSuccess`에서 `mine` 무효화.

### 3-4. 컴포넌트 배선 교체

| 컴포넌트 | 현재 (로컬 변이) | 변경 후 |
| --- | --- | --- |
| `useWorkspaceSetupWizard` | `setWorkspaces([workspace])` | `useCreateWorkspaceMutation` 결과 후 `setCurrentWorkspaceId(id)` |
| `WorkspaceEditView` | `updateWorkspaceName/StartDate`, `updateMemberProfile`, `removeWorkspace` | 기존 `useUpdateWorkspaceName/StartDate/MemberMutation` + 신규 leave mutation |
| `WorkspaceListView` | `removeWorkspace`, `setCurrentWorkspace` | leave mutation, `setCurrentWorkspaceId` |
| `WorkspaceJoinView` / `WorkspaceLandingView` | `setWorkspaces`/`setCurrentWorkspace` | join/create mutation + `setCurrentWorkspaceId` |
| `InvitationCard`(profile) | `respondToInvitation` | `workspacesApi.accept/declineInvite` mutation + `invites`·`mine` 무효화 |
| 초대 보내기 | `sendInvitation` | `workspacesApi.sendInvite` mutation |
| `auth/callback/page.tsx` | `setWorkspaces(workspaces)` | 제거 — 쿼리가 담당. `setCurrentWorkspaceId(workspaces[0]?.id)`만 |
| `useProfileSettings` 로그아웃 | `clearData()` | `clearData()`(id null) + `queryClient.clear()` |

모든 변이는 loading(버튼 pending)·error(토스트) 처리 필수.

검증(피드백 루프): 계정 A로 워크스페이스 생성 → 새로고침 후 유지 → 이름/시작일 수정 후 새로고침 유지 → 계정 B 이메일로 초대 → B 로그인 시 초대 카드 노출 → 수락 → 양쪽 멤버 목록에 서로 표시 → B 나가기 → A 목록에서 B 사라짐.

---

## Phase 4 — DDayHero 실데이터화

1. **다음 이벤트**: `MOCK_DATA.workspace.nextEvent` → 기존 `useAnniversaries()`의 `anniversaries[0]`(가장 임박한 기념일)으로 대체. DB 작업 불필요. `startDate` 없으면 해당 UI 영역 비노출.
2. **배경 이미지**: 현재 `URL.createObjectURL`(새로고침 시 소실) → `storageApi.uploadImage(file, userId)` → 신규 `updateBackground` mutation. 업로드 중 pending 표시, 실패 시 토스트.

검증: 배경 변경 → 새로고침 후 유지 → 상대 계정에서도 동일 배경 표시.

---

## Phase 5 — 정리

- `src/constants/mockData.ts` 삭제 (Phase 2·3·4 완료 시 참조 0이 됨 — `grep -rn "MOCK_DATA" src`로 확인 후)
- `npm run build` + lint 통과
- 참고: `MapView.tsx`의 `MOCK_MEMBER_LOCATION_MAP`은 mockData.ts와 무관한 지역 상수이며 **이번 범위에서 유지** (실위치 공유는 Supabase Realtime presence가 필요한 별도 설계)

---

## 구현 순서 및 이유

Phase 1(제거) → 2(로그인) → 3(워크스페이스) → 4(홈) → 5(정리).
2를 3보다 먼저 하는 이유: 목 로그인이 살아 있으면 목 워크스페이스(`initMockData`)가 계속 주입되어 3의 검증이 오염된다. 4는 3의 `useCurrentWorkspace`에 의존.

## 구현자 주의사항

- AGENTS.md 규칙 준수: 쿼리 키 직접 문자열 금지(`workspaceQueries` 경유), 컴포넌트에서 API 직접 호출 금지(훅 경유), async/await, 3상태 처리, 주석 규칙, `window.alert` 금지
- 스토어 재작성 시 persist 키를 바꾸지 말 것(기존 사용자 localStorage와의 migrate 경로 유지)
- `WorkspaceEditView`의 멤버 프로필 수정은 `useUpdateWorkspaceMemberMutation`이 이미 존재하니 그대로 사용 (updates 키는 snake_case `display_name`/`avatar_url`임에 주의)
