import { describe, expect, it } from "vitest";

import { getDateWithOffset } from "@/utils/date";
import { ANNIVERSARY_DISPLAY_COUNT } from "@/features/anniversary/constants/anniversary";

import { generateAnniversaries } from "./anniversaryUtils";

describe("generateAnniversaries", () => {
  it("오늘과 가장 가까운(과거·미래 무관) 기념일 순으로 정렬한다", () => {
    // 3000일 전에 시작 → 모든 마일스톤이 이미 지났으므로 |daysLeft|가 작을수록(최근에 지난 순) 앞에 온다
    const startDate = getDateWithOffset(-3000);
    const anniversaries = generateAnniversaries(startDate);
    const absDaysLeftList = anniversaries.map((a) => Math.abs(a.daysLeft));
    expect(absDaysLeftList).toEqual([...absDaysLeftList].sort((a, b) => a - b));
  });

  it("미래 기념일만 있으면 임박순으로 정렬한다", () => {
    const startDate = getDateWithOffset(-1); // 어제 시작 → 모든 마일스톤이 미래
    const anniversaries = generateAnniversaries(startDate);
    const daysLeftList = anniversaries.map((a) => a.daysLeft);
    expect(daysLeftList).toEqual([...daysLeftList].sort((a, b) => a - b));
  });

  it("오늘 시작(0일차)이면 100일 기념일까지 daysLeft가 양수다", () => {
    const startDate = getDateWithOffset(0);
    const anniversaries = generateAnniversaries(startDate);
    const dday100 = anniversaries.find((a) => a.id === "d-100");
    expect(dday100?.daysLeft).toBeGreaterThan(0);
  });

  it("전체 마일스톤 개수와 무관하게 ANNIVERSARY_DISPLAY_COUNT 개수만 반환한다", () => {
    const startDate = getDateWithOffset(0);
    const anniversaries = generateAnniversaries(startDate);
    expect(anniversaries.length).toBe(ANNIVERSARY_DISPLAY_COUNT);
  });

  it("각 기념일은 고유한 id를 가진다", () => {
    const startDate = getDateWithOffset(-500);
    const anniversaries = generateAnniversaries(startDate);
    const ids = anniversaries.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
