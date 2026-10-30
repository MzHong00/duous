import { describe, expect, it } from "vitest";

import { buildMarkedDates } from "./calendarUtils";

describe("buildMarkedDates", () => {
  it("시작·종료일 사이 모든 날짜에 색상을 표시한다", () => {
    const marks = buildMarkedDates([
      { startDate: "2026-01-01", endDate: "2026-01-03", color: "red" },
    ]);
    expect(marks).toEqual({
      "2026-01-01": ["red"],
      "2026-01-02": ["red"],
      "2026-01-03": ["red"],
    });
  });

  it("같은 날짜에 여러 색상이 겹치면 모두 누적한다", () => {
    const marks = buildMarkedDates([
      { startDate: "2026-01-01", endDate: "2026-01-01", color: "red" },
      { startDate: "2026-01-01", endDate: "2026-01-01", color: "blue" },
    ]);
    expect(marks["2026-01-01"]).toEqual(["red", "blue"]);
  });

  it("같은 색상이 중복되면 한 번만 기록한다", () => {
    const marks = buildMarkedDates([
      { startDate: "2026-01-01", endDate: "2026-01-02", color: "red" },
      { startDate: "2026-01-02", endDate: "2026-01-03", color: "red" },
    ]);
    expect(marks["2026-01-02"]).toEqual(["red"]);
  });

  it("빈 배열이면 빈 객체를 반환한다", () => {
    expect(buildMarkedDates([])).toEqual({});
  });
});
