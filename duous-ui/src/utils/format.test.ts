import { describe, expect, it } from "vitest";

import { getInitials, joinValuesWithDot } from "./format";

describe("joinValuesWithDot", () => {
  it("배열이 undefined면 빈 문자열을 반환한다", () => {
    expect(joinValuesWithDot(undefined, "name")).toBe("");
  });

  it("지정한 key의 문자열 값들을 · 으로 연결한다", () => {
    const arr = [{ name: "a" }, { name: "b" }, { name: "c" }];
    expect(joinValuesWithDot(arr, "name")).toBe("a · b · c");
  });

  it("excludeValue와 일치하는 값은 제외한다", () => {
    const arr = [{ name: "a" }, { name: "b" }];
    expect(joinValuesWithDot(arr, "name", "b")).toBe("a");
  });

  it("문자열이 아닌 값은 빈 값으로 취급해 제외한다", () => {
    const arr = [{ name: 1 }, { name: "b" }] as unknown as { name: string }[];
    expect(joinValuesWithDot(arr, "name")).toBe("b");
  });
});

describe("getInitials", () => {
  it("빈 문자열이면 물음표를 반환한다", () => {
    expect(getInitials("")).toBe("?");
  });

  it("첫 글자를 대문자로 반환한다", () => {
    expect(getInitials("john")).toBe("J");
  });

  it("한글 이름도 첫 글자를 그대로 반환한다", () => {
    expect(getInitials("홍길동")).toBe("홍");
  });
});
