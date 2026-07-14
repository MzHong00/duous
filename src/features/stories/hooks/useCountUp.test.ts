import { renderHook, act } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

import { useCountUp } from "./useCountUp";

describe("useCountUp", () => {
  let rafCallback: FrameRequestCallback | null = null;

  beforeEach(() => {
    rafCallback = null;
    vi.stubGlobal(
      "requestAnimationFrame",
      vi.fn((cb: FrameRequestCallback) => {
        rafCallback = cb;
        return 1;
      })
    );
    vi.stubGlobal("cancelAnimationFrame", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("target이 0이면 0을 유지한다", () => {
    const { result } = renderHook(() => useCountUp(0));
    expect(result.current).toBe(0);
  });

  it("target이 바뀌면 즉시 0으로 리셋 후 애니메이션을 재생한다", () => {
    let now = 0;
    vi.spyOn(performance, "now").mockImplementation(() => now);

    const { result, rerender } = renderHook(({ target }) => useCountUp(target), {
      initialProps: { target: 100 },
    });

    expect(result.current).toBe(0);

    now = 300;
    act(() => {
      rafCallback?.(now);
    });
    expect(result.current).toBeGreaterThan(0);

    rerender({ target: 50 });
    expect(result.current).toBe(0);
  });

  it("애니메이션이 진행되며 최종적으로 target에 도달한다", () => {
    let now = 0;
    vi.spyOn(performance, "now").mockImplementation(() => now);

    const { result } = renderHook(() => useCountUp(100));

    now = 900;
    act(() => {
      rafCallback?.(now);
    });

    expect(result.current).toBe(100);
  });
});
