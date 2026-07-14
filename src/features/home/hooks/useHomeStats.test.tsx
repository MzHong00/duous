import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useCurrentWorkspace } from "@/features/workspace/hooks/useCurrentWorkspace";
import { storyQueries } from "@/features/stories/queries/storyQueries";
import { useHomeStats } from "./useHomeStats";

import type { ReactNode } from "react";

vi.mock("@/features/workspace/hooks/useCurrentWorkspace", () => ({
  useCurrentWorkspace: vi.fn(),
}));

vi.mock("@/features/stories/queries/storyQueries", () => ({
  storyQueries: {
    list: vi.fn((workspaceId: string) => ({ queryKey: ["stories", "list", workspaceId] })),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return { Wrapper, queryClient };
};

describe("useHomeStats", () => {
  it("스토리 목록 중 최신 3개만 반환한다", () => {
    vi.mocked(useCurrentWorkspace).mockReturnValue({
      currentWorkspace: { id: "ws-1", name: "워크스페이스1", type: "couple", themeColor: "blue" },
      workspaces: [],
    } as any);
    const { Wrapper, queryClient } = createWrapper();
    const stories = [{ id: "1" }, { id: "2" }, { id: "3" }, { id: "4" }];
    queryClient.setQueryData(storyQueries.list("ws-1").queryKey, stories as any);

    const { result } = renderHook(() => useHomeStats(), { wrapper: Wrapper });

    expect(result.current.recentStories).toEqual(stories.slice(0, 3));
  });

  it("워크스페이스가 없으면 빈 배열을 반환한다", () => {
    vi.mocked(useCurrentWorkspace).mockReturnValue({
      currentWorkspace: null,
      workspaces: [],
    } as any);
    const { Wrapper } = createWrapper();

    const { result } = renderHook(() => useHomeStats(), { wrapper: Wrapper });

    expect(result.current.recentStories).toEqual([]);
  });
});
