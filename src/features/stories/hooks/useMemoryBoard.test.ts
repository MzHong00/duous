import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useMemoryBoard } from "./useMemoryBoard";

describe("useMemoryBoard", () => {
  it("아이템이 20개 이상이면 앞 5개는 bigItems, 다음 15개는 smallItems로 나눈다", () => {
    const items = Array.from({ length: 25 }, (_, i) => i);
    const { result } = renderHook(() => useMemoryBoard(items));

    expect(result.current.bigItems).toEqual([0, 1, 2, 3, 4]);
    expect(result.current.smallItems).toEqual(items.slice(5, 20));
  });

  it("아이템이 5개 이하면 모두 bigItems로 가고 smallItems는 빈 배열이다", () => {
    const items = [1, 2, 3];
    const { result } = renderHook(() => useMemoryBoard(items));

    expect(result.current.bigItems).toEqual([1, 2, 3]);
    expect(result.current.smallItems).toEqual([]);
  });

  it("아이템이 5개 초과 20개 미만이면 나머지가 smallItems로 간다", () => {
    const items = Array.from({ length: 10 }, (_, i) => i);
    const { result } = renderHook(() => useMemoryBoard(items));

    expect(result.current.bigItems).toEqual([0, 1, 2, 3, 4]);
    expect(result.current.smallItems).toEqual([5, 6, 7, 8, 9]);
  });

  it("빈 배열이면 bigItems, smallItems 모두 빈 배열이다", () => {
    const { result } = renderHook(() => useMemoryBoard<number>([]));

    expect(result.current.bigItems).toEqual([]);
    expect(result.current.smallItems).toEqual([]);
  });

  it("items 참조가 바뀌지 않으면 동일한 결과 객체를 재사용한다(useMemo)", () => {
    const items = [1, 2, 3];
    const { result, rerender } = renderHook(({ list }) => useMemoryBoard(list), {
      initialProps: { list: items },
    });

    const first = result.current;
    rerender({ list: items });

    expect(result.current).toBe(first);
  });
});
