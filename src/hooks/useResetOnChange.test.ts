import { renderHook } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it } from "vitest";

import { useResetOnChange } from "./useResetOnChange";

describe("useResetOnChange", () => {
  it("최초 렌더에서는 false를 반환한다", () => {
    const { result } = renderHook(() => useResetOnChange("a"));
    expect(result.current).toBe(false);
  });

  it("key가 유지되는 리렌더에서는 false를 반환한다", () => {
    const { result, rerender } = renderHook(({ key }) => useResetOnChange(key), {
      initialProps: { key: "a" },
    });

    rerender({ key: "a" });
    expect(result.current).toBe(false);
  });

  // useResetOnChange는 render-phase setState로 즉시 재렌더되므로,
  // 변경 감지(true) 자체는 같은 렌더 내부에서 다른 state를 리셋하는 용도로만 관찰 가능하다.
  // (실제 사용 예: useCountUp에서 targetChanged && target === 0일 때 setCount(0))
  it("key가 바뀌면 감지 렌더에서 다른 state를 리셋할 수 있다", () => {
    const { result, rerender } = renderHook(
      ({ key }) => {
        const [resetCount, setResetCount] = useState(0);
        const didChange = useResetOnChange(key);
        if (didChange) setResetCount((prev) => prev + 1);
        return resetCount;
      },
      { initialProps: { key: "a" } }
    );

    expect(result.current).toBe(0);

    rerender({ key: "b" });
    expect(result.current).toBe(1);

    rerender({ key: "b" });
    expect(result.current).toBe(1);
  });
});
