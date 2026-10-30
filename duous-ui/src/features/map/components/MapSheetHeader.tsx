"use client";
import { Route, Square } from "lucide-react";

import { cx } from "@/utils/cn";
import { ICON_SIZE } from "@/constants/style";
import { formatDistance, formatDuration } from "@/features/stories/utils/storyStats";

import styles from "./MapSheetHeader.module.scss";

interface MapSheetHeaderProps {
  storyCount: number; // 저장된 스토리 수
  totalDistanceKm: number; // 저장된 스토리의 총 이동 거리
  totalDurationMin: number; // 저장된 스토리의 총 소요 시간
  isRecording: boolean; // 기록 진행 여부
  recordingDistanceKm: number; // 기록 중인 경로의 실시간 이동 거리
  /** 기록 시작/종료 */
  onToggleRecording: () => void;
}

/** 지도 시트의 항상 보이는 영역 — 현재 상태 요약과 기록 버튼 하나 */
export const MapSheetHeader = ({
  storyCount,
  totalDistanceKm,
  totalDurationMin,
  isRecording,
  recordingDistanceKm,
  onToggleRecording,
}: MapSheetHeaderProps) => {
  return (
    <div className={styles.header}>
      <div className={styles.summary}>
        {isRecording ? (
          <>
            <span className={styles.recordingLabel}>
              <span className={styles.pulseDot} />
              기록 중
            </span>
            <span className={styles.recordingValue}>{formatDistance(recordingDistanceKm)}</span>
            <span className={styles.metricLabel}>지금까지 걸은 거리</span>
          </>
        ) : (
          <>
            <span className={styles.label}>전체 기록</span>
            <dl className={styles.metrics}>
              <div className={styles.metric}>
                <dd className={styles.metricValue}>{formatDistance(totalDistanceKm)}</dd>
                <dt className={styles.metricLabel}>걸은 거리</dt>
              </div>
              <div className={styles.metric}>
                <dd className={styles.metricValue}>{formatDuration(totalDurationMin)}</dd>
                <dt className={styles.metricLabel}>걸은 시간</dt>
              </div>
              <div className={styles.metric}>
                <dd className={styles.metricValue}>{storyCount}개</dd>
                <dt className={styles.metricLabel}>스토리</dt>
              </div>
            </dl>
          </>
        )}
      </div>

      <button
        type="button"
        onClick={onToggleRecording}
        className={cx(styles.recordButton, isRecording && styles.recordButtonActive)}
      >
        {isRecording ? (
          <Square size={ICON_SIZE.md} fill="currentColor" />
        ) : (
          <Route size={ICON_SIZE.md} />
        )}
        {isRecording ? "기록 끝내기" : "기록 시작"}
      </button>
    </div>
  );
};
