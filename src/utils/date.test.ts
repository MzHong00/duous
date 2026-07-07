import { describe, expect, it } from "vitest";

import {
  calculateDDay,
  formatDate,
  getDateWithOffset,
  getIntermediateDates,
  getRelativeDateLabel,
  getTodayDateString,
  isPastDate,
} from "./date";

describe("calculateDDay", () => {
  it("빈 문자열이면 0을 반환한다", () => {
    expect(calculateDDay("")).toBe(0);
  });

  it("오늘 날짜를 시작일로 주면 D-1을 반환한다", () => {
    expect(calculateDDay(getTodayDateString())).toBe(1);
  });
});

describe("formatDate", () => {
  it("빈 값이면 빈 문자열을 반환한다", () => {
    expect(formatDate(null)).toBe("");
    expect(formatDate(undefined)).toBe("");
  });

  it("기본 포맷으로 날짜를 포맷팅한다", () => {
    expect(formatDate("2026-01-05")).toBe("2026.01.05");
  });

  it("포맷을 지정하면 해당 포맷으로 반환한다", () => {
    expect(formatDate("2026-01-05", "YYYY-MM-DD")).toBe("2026-01-05");
  });
});

describe("getRelativeDateLabel", () => {
  it("빈 문자열이면 빈 문자열을 반환한다", () => {
    expect(getRelativeDateLabel("")).toBe("");
  });

  it("지난 날짜는 지연 일수를 표시한다", () => {
    const twoDaysAgo = getDateWithOffset(-2);
    expect(getRelativeDateLabel(twoDaysAgo)).toBe("2일 지연");
  });
});

describe("isPastDate", () => {
  it("빈 문자열이면 false를 반환한다", () => {
    expect(isPastDate("")).toBe(false);
  });

  it("과거 날짜는 true를 반환한다", () => {
    expect(isPastDate("2000-01-01")).toBe(true);
  });

  it("미래 날짜는 false를 반환한다", () => {
    expect(isPastDate("2999-01-01")).toBe(false);
  });
});

describe("getIntermediateDates", () => {
  it("시작일과 종료일 사이의 날짜를 반환한다", () => {
    expect(getIntermediateDates("2026-01-01", "2026-01-04")).toEqual(["2026-01-02", "2026-01-03"]);
  });

  it("연속된 날짜면 빈 배열을 반환한다", () => {
    expect(getIntermediateDates("2026-01-01", "2026-01-02")).toEqual([]);
  });
});
