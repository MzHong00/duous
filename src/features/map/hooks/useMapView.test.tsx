import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, act } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";

import { useCurrentWorkspace } from "@/features/workspace/hooks/useCurrentWorkspace";
import { useStoryStore, storyActions } from "@/features/stories/stores/useStoryStore";
import { storyQueries } from "@/features/stories/queries/storyQueries";
import { authQueries } from "@/features/auth/queries/authQueries";
import { useStoryRecording } from "@/features/map/hooks/useStoryRecording";
import { useMapView } from "./useMapView";

import type { Story } from "@/features/stories/types/story";
import type { User } from "@/types/user";
import type { Workspace, WorkspaceMember } from "@/features/workspace/types/workspace";
import type { ReactNode } from "react";

vi.mock("@/features/workspace/hooks/useCurrentWorkspace", () => ({
  useCurrentWorkspace: vi.fn(),
}));

vi.mock("@/features/stories/stores/useStoryStore", () => ({
  useStoryStore: vi.fn(),
  storyActions: {
    setSelectedStoryId: vi.fn(),
  },
}));

vi.mock("@/features/map/hooks/useStoryRecording", () => ({
  useStoryRecording: vi.fn(),
}));

vi.mock("@/features/stories/queries/storyQueries", () => ({
  storyQueries: {
    list: vi.fn((workspaceId: string) => ({ queryKey: ["stories", "list", workspaceId] })),
  },
}));

vi.mock("@/features/auth/queries/authQueries", () => ({
  authQueries: {
    user: vi.fn(() => ({ queryKey: ["auth", "user"] })),
  },
}));

const ME_ID = "user-me";
const PARTNER_ID = "user-partner";

const createMember = (id: string, name: string): WorkspaceMember => ({
  id,
  name,
  email: `${id}@test.com`,
  role: "member",
});

const createWorkspace = (members: WorkspaceMember[]): Workspace => ({
  id: "ws-1",
  name: "워크스페이스1",
  type: "couple",
  themeColor: "blue",
  members,
});

const createWrapper = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return { Wrapper, queryClient };
};

/** 로그인 사용자와 스토리 목록을 캐시에 주입한 뒤 훅을 렌더링 */
const renderMapView = () => {
  const { Wrapper, queryClient } = createWrapper();
  queryClient.setQueryData(authQueries.user().queryKey, { id: ME_ID } as unknown as User);
  queryClient.setQueryData(storyQueries.list("ws-1").queryKey, [] as unknown as Story[]);
  return renderHook(() => useMapView(), { wrapper: Wrapper });
};

describe("useMapView", () => {
  const toggleRecording = vi.fn();
  const myLocation = { lat: 37.5, lng: 127.0 };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useCurrentWorkspace).mockReturnValue({
      currentWorkspace: createWorkspace([
        createMember(ME_ID, "나"),
        createMember(PARTNER_ID, "상대"),
      ]),
      workspaces: [],
    } as unknown as ReturnType<typeof useCurrentWorkspace>);
    vi.mocked(useStoryStore).mockReturnValue(null);
    vi.mocked(useStoryRecording).mockReturnValue({
      myLocation,
      isRecording: false,
      recordingPath: [],
      toggleRecording,
    } as unknown as ReturnType<typeof useStoryRecording>);
  });

  it("본인 멤버와 본인 위치만 반환한다", () => {
    const { result } = renderMapView();

    expect(result.current.myMember?.id).toBe(ME_ID);
    expect(result.current.myLocation).toEqual(myLocation);
  });

  it("selectStory 호출 시 스토리를 선택한다", () => {
    const { result } = renderMapView();

    act(() => {
      result.current.selectStory("story-1");
    });

    expect(storyActions.setSelectedStoryId).toHaveBeenCalledWith("story-1");
  });
});
