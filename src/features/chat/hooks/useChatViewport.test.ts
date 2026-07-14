import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useChatViewport } from "./useChatViewport";

describe("useChatViewport", () => {
  it("scrollDep이 바뀌면 bottomRef를 부드럽게 스크롤한다", () => {
    const scrollIntoView = vi.fn();
    const { result, rerender } = renderHook(({ dep }) => useChatViewport(dep), {
      initialProps: { dep: 0 },
    });

    Object.defineProperty(result.current.bottomRef, "current", {
      value: { scrollIntoView },
      writable: true,
    });

    rerender({ dep: 1 });

    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: "smooth" });
  });

  it("visualViewport의 resize 이벤트에서 즉시 스크롤한다", () => {
    const scrollIntoView = vi.fn();
    const listeners: Record<string, () => void> = {};
    const mockViewport = {
      addEventListener: (event: string, handler: () => void) => {
        listeners[event] = handler;
      },
      removeEventListener: vi.fn(),
    };
    vi.stubGlobal("visualViewport", mockViewport);

    const { result, unmount } = renderHook(() => useChatViewport(0));

    Object.defineProperty(result.current.bottomRef, "current", {
      value: { scrollIntoView },
      writable: true,
    });

    listeners.resize?.();

    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: "instant" });

    unmount();
    vi.unstubAllGlobals();
  });
});
