import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useCurrentWorkspace } from "@/features/workspace/hooks/useCurrentWorkspace";
import { getDateWithOffset } from "@/utils/date";

import { useAnniversaries } from "./useAnniversaries";

vi.mock("@/features/workspace/hooks/useCurrentWorkspace", () => ({
  useCurrentWorkspace: vi.fn(),
}));

describe("useAnniversaries", () => {
  it("현재 워크스페이스가 없으면 함께한 일수 0, 빈 기념일 목록을 반환한다", () => {
    vi.mocked(useCurrentWorkspace).mockReturnValue({
      // @ts-expect-error 테스트에서는 필요한 필드만 채운다
      currentWorkspace: null,
      workspaces: [],
      isPending: false,
      isError: false,
    });

    const { result } = renderHook(() => useAnniversaries());

    expect(result.current.startDate).toBeUndefined();
    expect(result.current.days).toBe(0);
    expect(result.current.anniversaries).toEqual([]);
  });

  it("시작일이 있으면 함께한 일수와 기념일 목록을 계산한다", () => {
    const startDate = getDateWithOffset(-99);
    vi.mocked(useCurrentWorkspace).mockReturnValue({
      // @ts-expect-error 테스트에서는 필요한 필드만 채운다
      currentWorkspace: { startDate },
      workspaces: [],
      isPending: false,
      isError: false,
    });

    const { result } = renderHook(() => useAnniversaries());

    expect(result.current.startDate).toBe(startDate);
    expect(result.current.days).toBe(100);
    expect(result.current.anniversaries.length).toBeGreaterThan(0);
  });
});
