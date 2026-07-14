import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useWorkspaceStore } from "@/features/workspace/stores/useWorkspaceStore";
import { workspaceQueries } from "@/features/workspace/queries/workspaceQueries";
import { useCurrentWorkspace } from "./useCurrentWorkspace";

import type { ReactNode } from "react";
import type { Workspace } from "@/features/workspace/types/workspace";

vi.mock("@/features/workspace/stores/useWorkspaceStore", () => ({
  useWorkspaceStore: vi.fn(),
}));

vi.mock("@/features/workspace/queries/workspaceQueries", () => ({
  workspaceQueries: { mine: vi.fn(() => ({ queryKey: ["workspaces", "mine"] })) },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return { Wrapper, queryClient };
};

const WORKSPACES: Workspace[] = [
  { id: "ws-1", name: "워크스페이스1", type: "couple", themeColor: "blue" },
  { id: "ws-2", name: "워크스페이스2", type: "couple", themeColor: "pink" },
];

describe("useCurrentWorkspace", () => {
  it("저장된 currentWorkspaceId와 일치하는 워크스페이스를 반환한다", async () => {
    vi.mocked(useWorkspaceStore).mockReturnValue("ws-2");
    const { Wrapper, queryClient } = createWrapper();
    queryClient.setQueryData(workspaceQueries.mine().queryKey, WORKSPACES);

    const { result } = renderHook(() => useCurrentWorkspace(), { wrapper: Wrapper });

    expect(result.current.currentWorkspace).toEqual(WORKSPACES[1]);
    expect(result.current.workspaces).toEqual(WORKSPACES);
  });

  it("저장된 ID가 목록에 없으면 첫 워크스페이스로 폴백한다", () => {
    vi.mocked(useWorkspaceStore).mockReturnValue("missing-id");
    const { Wrapper, queryClient } = createWrapper();
    queryClient.setQueryData(workspaceQueries.mine().queryKey, WORKSPACES);

    const { result } = renderHook(() => useCurrentWorkspace(), { wrapper: Wrapper });

    expect(result.current.currentWorkspace).toEqual(WORKSPACES[0]);
  });

  it("워크스페이스 목록이 비어있으면 null을 반환한다", () => {
    vi.mocked(useWorkspaceStore).mockReturnValue(null);
    const { Wrapper } = createWrapper();

    const { result } = renderHook(() => useCurrentWorkspace(), { wrapper: Wrapper });

    expect(result.current.currentWorkspace).toBeNull();
    expect(result.current.workspaces).toEqual([]);
  });
});
