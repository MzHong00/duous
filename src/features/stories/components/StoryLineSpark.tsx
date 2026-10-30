import { useMemo } from "react";

import { normalize } from "@/features/map/utils/pathPreviewUtils";

import styles from "./StoryLineSpark.module.scss";

import type { LocationPoint } from "@/features/stories/types/story";

const VIEW_W = 48;
const VIEW_H = 26;
const PAD = 4; // 선 굵기·끝점이 잘리지 않도록 확보하는 여백
const STROKE_WIDTH = 2;
const ENDPOINT_RADIUS = 2.4;
const SINGLE_POINT_RADIUS = 3;

interface StoryLineSparkProps {
  path: LocationPoint[]; // 그릴 경로 좌표
  color: string; // 경로 색상 (지도 위 폴리라인과 동일)
}

/** 스토리 경로의 실제 모양을 축소해 보여주는 미니 라인 */
export const StoryLineSpark = ({ path, color }: StoryLineSparkProps) => {
  // 좌표를 뷰포트 크기로 정규화한다 (경로가 바뀔 때만 재계산)
  const points = useMemo(() => {
    if (path.length === 0) return [];
    const lats = path.map((p) => p.latitude);
    const lngs = path.map((p) => p.longitude);
    const innerW = VIEW_W - PAD * 2;
    const innerH = VIEW_H - PAD * 2;
    return path.map((p) => ({
      x: PAD + normalize(p.longitude, Math.min(...lngs), Math.max(...lngs), innerW),
      y: PAD + (innerH - normalize(p.latitude, Math.min(...lats), Math.max(...lats), innerH)),
    }));
  }, [path]);

  const endPoint = points[points.length - 1]; // 도착 지점 (경로의 끝을 점으로 찍어 방향을 알린다)

  return (
    <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} className={styles.spark} aria-hidden>
      {points.length === 1 && (
        <circle cx={points[0].x} cy={points[0].y} r={SINGLE_POINT_RADIUS} fill={color} />
      )}
      {points.length > 1 && (
        <>
          <polyline
            points={points.map((p) => `${p.x},${p.y}`).join(" ")}
            fill="none"
            stroke={color}
            strokeWidth={STROKE_WIDTH}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx={endPoint.x} cy={endPoint.y} r={ENDPOINT_RADIUS} fill={color} />
        </>
      )}
    </svg>
  );
};
