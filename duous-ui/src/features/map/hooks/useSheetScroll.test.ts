import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useSheetScroll } from "./useSheetScroll";

/** 스크롤 컨테이너 역할을 하는 엘리먼트를 훅의 ref에 연결한다 */
const attachElement = (ref: { current: HTMLDivElement | null }) => {
  const el = document.createElement("div");
  ref.current = el;
  return el;
};

describe("useSheetScroll", () => {
  it("상세로 들어가면 스크롤을 맨 위로 되돌린다", () => {
    const { result, rerender } = renderHook(
      ({ key }: { key: string | null }) => useSheetScroll(key),
      {
        initialProps: { key: null as string | null },
      }
    );
    const el = attachElement(result.current);
    el.scrollTop = 120;

    rerender({ key: "story-1" });

    expect(el.scrollTop).toBe(0);
  });

  it("목록으로 돌아오면 보고 있던 위치로 스크롤을 복원한다", () => {
    const { result, rerender } = renderHook(
      ({ key }: { key: string | null }) => useSheetScroll(key),
      {
        initialProps: { key: "story-0" as string | null },
      }
    );
    const el = attachElement(result.current);

    // 목록으로 나와 스크롤을 내린 상태를 만든다
    rerender({ key: null });
    el.scrollTop = 90;
    el.dispatchEvent(new Event("scroll"));

    rerender({ key: "story-1" });
    expect(el.scrollTop).toBe(0);

    rerender({ key: null });
    expect(el.scrollTop).toBe(90);
  });
});
