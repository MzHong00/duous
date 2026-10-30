import { describe, expect, it } from "vitest";

import { isSafeRedirectPath, withParams, withQuery } from "./route";

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

describe("isSafeRedirectPath", () => {
  it("내부 상대 경로는 안전하다고 판단한다", () => {
    expect(isSafeRedirectPath("/todo")).toBe(true);
  });

  it("null/undefined/빈 문자열은 안전하지 않다고 판단한다", () => {
    expect(isSafeRedirectPath(null)).toBe(false);
    expect(isSafeRedirectPath(undefined)).toBe(false);
    expect(isSafeRedirectPath("")).toBe(false);
  });

  it("프로토콜 상대 경로(//)는 안전하지 않다고 판단한다", () => {
    expect(isSafeRedirectPath("//evil.com")).toBe(false);
  });

  it("백슬래시로 시작하는 프로토콜 상대 경로(/\\)는 안전하지 않다고 판단한다", () => {
    expect(isSafeRedirectPath("/\\evil.com")).toBe(false);
  });

  it("절대 URL은 안전하지 않다고 판단한다", () => {
    expect(isSafeRedirectPath("https://evil.com")).toBe(false);
  });

  it("탭/개행 문자로 브라우저의 // 정규화를 우회하려는 경로는 안전하지 않다고 판단한다", () => {
    expect(isSafeRedirectPath("/\t/evil.com")).toBe(false);
    expect(isSafeRedirectPath("/\n/evil.com")).toBe(false);
    expect(isSafeRedirectPath("/\r/evil.com")).toBe(false);
  });
});
