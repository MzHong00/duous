import type { Story, LocationPoint } from "@/features/stories/types/story";

const EARTH_RADIUS_KM = 6371; // 지구 평균 반지름(km)
const MS_PER_MINUTE = 60_000;
const MINUTES_PER_HOUR = 60;

export interface StoryStats {
  distanceKm: number; // 경로 총 이동 거리(km)
  durationMin: number; // 첫 지점 ~ 마지막 지점 소요 시간(분)
  pointCount: number; // 기록된 좌표 지점 수
}

export interface StoriesSummary {
  storyCount: number; // 스토리 라인 총 개수
  totalDistanceKm: number; // 전체 이동 거리 합(km)
  totalDurationMin: number; // 전체 소요 시간 합(분)
  latestDate: string; // 가장 최근 스토리 날짜 (없으면 빈 문자열)
}

const toRadians = (deg: number) => (deg * Math.PI) / 180;

/** 두 좌표 사이의 대권 거리(km)를 하버사인 공식으로 계산한다 */
const getDistanceKm = (from: LocationPoint, to: LocationPoint) => {
  const dLat = toRadians(to.latitude - from.latitude);
  const dLng = toRadians(to.longitude - from.longitude);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(from.latitude)) * Math.cos(toRadians(to.latitude)) * Math.sin(dLng / 2) ** 2;
  return EARTH_RADIUS_KM * 2 * Math.asin(Math.min(1, Math.sqrt(a)));
};

/** 경로 좌표 목록의 총 이동 거리(km)를 계산한다 */
export const getPathDistanceKm = (path: LocationPoint[]): number =>
  path.reduce(
    (sum, point, index) => (index === 0 ? sum : sum + getDistanceKm(path[index - 1], point)),
    0
  );

/** 스토리 경로에서 이동 거리·소요 시간·지점 수를 계산한다 */
export const getStoryStats = (story: Story): StoryStats => {
  const { path } = story;
  const distanceKm = getPathDistanceKm(path);
  const durationMs = path.length > 1 ? path[path.length - 1].timestamp - path[0].timestamp : 0;

  return {
    distanceKm,
    durationMin: Math.max(0, Math.round(durationMs / MS_PER_MINUTE)),
    pointCount: path.length,
  };
};

/** 스토리 목록 전체의 합계 통계를 계산한다 */
export const getStoriesSummary = (stories: Story[]): StoriesSummary =>
  stories.reduce<StoriesSummary>(
    (summary, story) => {
      const { distanceKm, durationMin } = getStoryStats(story);
      return {
        storyCount: summary.storyCount + 1,
        totalDistanceKm: summary.totalDistanceKm + distanceKm,
        totalDurationMin: summary.totalDurationMin + durationMin,
        latestDate: story.date > summary.latestDate ? story.date : summary.latestDate,
      };
    },
    { storyCount: 0, totalDistanceKm: 0, totalDurationMin: 0, latestDate: "" }
  );

/** 거리(km)를 1km 미만은 m 단위로 표기한다 */
export const formatDistance = (distanceKm: number): string =>
  distanceKm < 1 ? `${Math.round(distanceKm * 1000)}m` : `${distanceKm.toFixed(1)}km`;

/** 소요 시간(분)을 60분 이상이면 "N시간 M분"으로 표기한다 */
export const formatDuration = (durationMin: number): string => {
  if (durationMin < MINUTES_PER_HOUR) return `${durationMin}분`;
  const hours = Math.floor(durationMin / MINUTES_PER_HOUR);
  const minutes = durationMin % MINUTES_PER_HOUR;
  return minutes === 0 ? `${hours}시간` : `${hours}시간 ${minutes}분`;
};
