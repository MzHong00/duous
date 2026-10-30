import { OverlayView } from "@react-google-maps/api";

import styles from "./StoryEndpointMarker.module.scss";

import type { CSSProperties } from "react";

interface StoryEndpointMarkerProps {
  lat: number; // 위도
  lng: number; // 경도
  color: string; // 경로 색상
  isStart: boolean; // 시작 지점 여부 (도착 지점과 채움을 반대로 그린다)
}

/** 선택된 경로의 시작·도착 지점 표시 — 경로가 어디서 시작해 어디서 끝났는지 알린다 */
export const StoryEndpointMarker = ({ lat, lng, color, isStart }: StoryEndpointMarkerProps) => {
  return (
    <OverlayView position={{ lat, lng }} mapPaneName={OverlayView.OVERLAY_LAYER}>
      <span
        className={isStart ? styles.start : styles.end}
        style={{ "--path-color": color } as CSSProperties}
      />
    </OverlayView>
  );
};
