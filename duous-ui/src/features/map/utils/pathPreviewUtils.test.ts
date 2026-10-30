import { describe, expect, it } from "vitest";

import { fmtCoord, getWaypointLabel, normalize } from "./pathPreviewUtils";

describe("normalize", () => {
  it("min과 max가 같으면 size의 절반을 반환한다", () => {
    expect(normalize(10, 5, 5, 100)).toBe(50);
  });

  it("값을 min~max 범위 기준으로 size 안에 정규화한다", () => {
    expect(normalize(5, 0, 10, 100)).toBe(50);
    expect(normalize(0, 0, 10, 100)).toBe(0);
    expect(normalize(10, 0, 10, 100)).toBe(100);
  });
});

describe("fmtCoord", () => {
  it("소수점 5자리로 반환한다", () => {
    expect(fmtCoord(37.1234567)).toBe("37.12346");
  });
});

describe("getWaypointLabel", () => {
  it("첫 번째 정점은 시작을 반환한다", () => {
    expect(getWaypointLabel(0, 3)).toBe("시작");
  });

  it("마지막 정점은 도착을 반환한다", () => {
    expect(getWaypointLabel(2, 3)).toBe("도착");
  });

  it("중간 정점은 경유 번호를 반환한다", () => {
    expect(getWaypointLabel(1, 3)).toBe("경유 1");
  });
});
