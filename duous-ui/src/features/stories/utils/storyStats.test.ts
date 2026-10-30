import { describe, expect, it } from "vitest";

import { getStoryStats, getStoriesSummary, formatDistance, formatDuration } from "./storyStats";

import type { Story } from "@/features/stories/types/story";

const createStory = (id: string, date: string, path: Story["path"]): Story => ({
  id,
  date,
  path,
  pathColor: "#000000",
  userId: "user-1",
  workspaceId: "ws-1",
});

describe("getStoryStats", () => {
  it("경로가 없으면 거리·시간·지점 수가 모두 0이다", () => {
    expect(getStoryStats(createStory("s1", "2026-01-01", []))).toEqual({
      distanceKm: 0,
      durationMin: 0,
      pointCount: 0,
    });
  });

  it("두 지점 사이의 거리와 소요 시간을 계산한다", () => {
    const stats = getStoryStats(
      createStory("s1", "2026-01-01", [
        { latitude: 37.5, longitude: 127.0, timestamp: 0 },
        { latitude: 37.51, longitude: 127.0, timestamp: 600_000 },
      ])
    );

    expect(stats.distanceKm).toBeCloseTo(1.11, 1);
    expect(stats.durationMin).toBe(10);
    expect(stats.pointCount).toBe(2);
  });
});

describe("getStoriesSummary", () => {
  it("스토리 개수·총 거리·총 시간·최근 날짜를 합산한다", () => {
    const summary = getStoriesSummary([
      createStory("s1", "2026-01-01", [
        { latitude: 37.5, longitude: 127.0, timestamp: 0 },
        { latitude: 37.51, longitude: 127.0, timestamp: 600_000 },
      ]),
      createStory("s2", "2026-02-01", [
        { latitude: 37.5, longitude: 127.0, timestamp: 0 },
        { latitude: 37.51, longitude: 127.0, timestamp: 1_200_000 },
      ]),
    ]);

    expect(summary.storyCount).toBe(2);
    expect(summary.totalDistanceKm).toBeCloseTo(2.22, 1);
    expect(summary.totalDurationMin).toBe(30);
    expect(summary.latestDate).toBe("2026-02-01");
  });

  it("스토리가 없으면 초기값을 반환한다", () => {
    expect(getStoriesSummary([])).toEqual({
      storyCount: 0,
      totalDistanceKm: 0,
      totalDurationMin: 0,
      latestDate: "",
    });
  });
});

describe("formatDistance", () => {
  it("1km 미만은 m 단위로 표기한다", () => {
    expect(formatDistance(0.42)).toBe("420m");
  });

  it("1km 이상은 소수점 한 자리 km로 표기한다", () => {
    expect(formatDistance(3.456)).toBe("3.5km");
  });
});

describe("formatDuration", () => {
  it("60분 미만은 분으로 표기한다", () => {
    expect(formatDuration(45)).toBe("45분");
  });

  it("60분 이상은 시간과 분으로 표기한다", () => {
    expect(formatDuration(125)).toBe("2시간 5분");
    expect(formatDuration(120)).toBe("2시간");
  });
});
