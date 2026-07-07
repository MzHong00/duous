import { describe, expect, it } from "vitest";

import { withParams, withQuery } from "./route";

describe("withParams", () => {
  it("base 뒤에 파라미터를 이어붙인다", () => {
    expect(withParams("/workspace", "abc")).toBe("/workspace/abc");
  });

  it("base 끝의 슬래시를 정리한다", () => {
    expect(withParams("/workspace/", "abc")).toBe("/workspace/abc");
  });

  it("여러 파라미터를 순서대로 이어붙인다", () => {
    expect(withParams("/workspace", "abc", 1)).toBe("/workspace/abc/1");
  });

  it("파라미터를 URI 인코딩한다", () => {
    expect(withParams("/search", "a b")).toBe("/search/a%20b");
  });
});

describe("withQuery", () => {
  it("정의된 값만 쿼리스트링으로 붙인다", () => {
    expect(withQuery("/list", { a: "1", b: undefined, c: "" })).toBe("/list?a=1");
  });

  it("쿼리 값이 없으면 base를 그대로 반환한다", () => {
    expect(withQuery("/list", { a: undefined })).toBe("/list");
  });

  it("여러 쿼리를 &로 연결한다", () => {
    expect(withQuery("/list", { a: "1", b: "2" })).toBe("/list?a=1&b=2");
  });

  it("쿼리 값을 URI 인코딩한다", () => {
    expect(withQuery("/list", { q: "a b" })).toBe("/list?q=a%20b");
  });
});
