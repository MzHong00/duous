import { renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useCurrentWorkspace } from "@/features/workspace/hooks/useCurrentWorkspace";
import { COOKIE_KEYS } from "@/constants/config";
import { useWorkspaceThemeSync } from "./useWorkspaceThemeSync";

vi.mock("@/features/workspace/hooks/useCurrentWorkspace", () => ({
  useCurrentWorkspace: vi.fn(),
}));

describe("useWorkspaceThemeSync", () => {
  afterEach(() => {
    delete document.documentElement.dataset.theme;
    vi.mocked(useCurrentWorkspace).mockReset();
  });

  it("현재 워크스페이스의 themeColor를 data-theme 속성에 반영한다", () => {
    vi.mocked(useCurrentWorkspace).mockReturnValue({
      currentWorkspace: { id: "ws-1", themeColor: "pink" },
    } as unknown as ReturnType<typeof useCurrentWorkspace>);

    renderHook(() => useWorkspaceThemeSync());

    expect(document.documentElement.dataset.theme).toBe("pink");
  });

  it("테마를 쿠키에 남겨 다음 방문의 첫 렌더에 반영되게 한다", () => {
    vi.mocked(useCurrentWorkspace).mockReturnValue({
      currentWorkspace: { id: "ws-1", themeColor: "pink" },
    } as unknown as ReturnType<typeof useCurrentWorkspace>);

    renderHook(() => useWorkspaceThemeSync());

    expect(document.cookie).toContain(`${COOKIE_KEYS.THEME}=pink`);
  });

  it("현재 워크스페이스가 없으면 data-theme을 설정하지 않는다", () => {
    vi.mocked(useCurrentWorkspace).mockReturnValue({
      currentWorkspace: null,
    } as unknown as ReturnType<typeof useCurrentWorkspace>);

    renderHook(() => useWorkspaceThemeSync());

    expect(document.documentElement.dataset.theme).toBeUndefined();
  });
});
