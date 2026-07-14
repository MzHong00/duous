import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useCurrentWorkspace } from "@/features/workspace/hooks/useCurrentWorkspace";
import { authQueries } from "@/features/auth/queries/authQueries";
import { DEFAULT_PARTNER } from "@/features/chat/constants/chat";
import { useChatPartner } from "./useChatPartner";

import type { ReactNode } from "react";

vi.mock("@/features/workspace/hooks/useCurrentWorkspace", () => ({
  useCurrentWorkspace: vi.fn(),
}));

vi.mock("@/features/auth/queries/authQueries", () => ({
  authQueries: { user: vi.fn(() => ({ queryKey: ["auth", "user"] })) },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return { Wrapper, queryClient };
};

describe("useChatPartner", () => {
  it("나를 제외한 첫 멤버를 파트너로 반환한다", () => {
    vi.mocked(useCurrentWorkspace).mockReturnValue({
      currentWorkspace: {
        id: "ws-1",
        name: "워크스페이스1",
        type: "couple",
        themeColor: "blue",
        members: [
          { id: "me", name: "나", avatar: undefined },
          { id: "partner-1", name: "상대", avatar: undefined },
        ],
      },
      workspaces: [],
    } as any);
    const { Wrapper, queryClient } = createWrapper();
    queryClient.setQueryData(authQueries.user().queryKey, { id: "me", name: "나" });

    const { result } = renderHook(() => useChatPartner(), { wrapper: Wrapper });

    expect(result.current).toEqual({ id: "partner-1", name: "상대", avatar: undefined });
  });

  it("멤버 목록이 없으면 기본 파트너를 반환한다", () => {
    vi.mocked(useCurrentWorkspace).mockReturnValue({
      currentWorkspace: null,
      workspaces: [],
    } as any);
    const { Wrapper } = createWrapper();

    const { result } = renderHook(() => useChatPartner(), { wrapper: Wrapper });

    expect(result.current).toEqual(DEFAULT_PARTNER);
  });

  it("나를 제외한 멤버가 없으면 기본 파트너를 반환한다", () => {
    vi.mocked(useCurrentWorkspace).mockReturnValue({
      currentWorkspace: {
        id: "ws-1",
        name: "워크스페이스1",
        type: "couple",
        themeColor: "blue",
        members: [{ id: "me", name: "나", avatar: undefined }],
      },
      workspaces: [],
    } as any);
    const { Wrapper, queryClient } = createWrapper();
    queryClient.setQueryData(authQueries.user().queryKey, { id: "me", name: "나" });

    const { result } = renderHook(() => useChatPartner(), { wrapper: Wrapper });

    expect(result.current).toEqual(DEFAULT_PARTNER);
  });
});
