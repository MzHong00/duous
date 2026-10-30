import { describe, expect, it } from "vitest";

import { cx } from "./cn";

describe("cx", () => {
  it("truthy 클래스명만 공백으로 합친다", () => {
    expect(cx("a", "b", "c")).toBe("a b c");
  });

  it("false/null/undefined는 제외한다", () => {
    expect(cx("a", false, null, undefined, "b")).toBe("a b");
  });

  it("인자가 없으면 빈 문자열을 반환한다", () => {
    expect(cx()).toBe("");
  });
});
