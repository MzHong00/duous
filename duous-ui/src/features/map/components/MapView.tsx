"use client";
import dynamic from "next/dynamic";

import { useMapView } from "@/features/map/hooks/useMapView";
import { useSheetScroll } from "@/features/map/hooks/useSheetScroll";
import { MapLoadState } from "@/features/map/components/MapLoadState";
import { MapSheetHeader } from "@/features/map/components/MapSheetHeader";
import { MapStoryInfo } from "@/features/map/components/MapStoryInfo";
import { StoryLineList } from "@/features/map/components/StoryLineList";
import { BottomDrawer } from "@/components/layout/BottomDrawer";

import styles from "./MapView.module.scss";

const SHEET_PEEK_HEIGHT = 96; // 핸들 + 요약/기록 버튼이 항상 보이는 높이(px)

// Google Maps SDK(@react-google-maps/api)는 지도 페이지에서만 필요한 무거운 서드파티 라이브러리라
// 초기 번들에서 분리하고, 진입 시에만 청크를 내려받도록 지연 로딩한다 (SSR 불가: window/DOM 의존)
const GoogleMapView = dynamic(
  () => import("@/features/map/components/GoogleMapView").then((mod) => mod.GoogleMapView),
  { ssr: false, loading: () => <MapLoadState status="loading" /> }
);

export const MapView = () => {
  const {
    myMember,
    myLocation,
    isRecording,
    recordingPath,
    recordingDistanceKm,
    toggleRecording,
    stories,
    summary,
    selectedStoryId,
    selectedStory,
    selectStory,
    clearSelectedStory,
  } = useMapView();
  const sheetContentRef = useSheetScroll(selectedStoryId);

  return (
    <div className={styles.page}>
      <GoogleMapView
        center={myLocation}
        myMember={myMember}
        stories={stories}
        recordingPath={recordingPath}
        isRecording={isRecording}
        selectedStoryId={selectedStoryId}
        onStoryClick={selectStory}
      />

      {/* 지도 위에 뜨는 레이어는 이 시트 하나뿐 — 요약·기록·목록·상세를 모두 담는다 */}
      <BottomDrawer
        minHeight={SHEET_PEEK_HEIGHT}
        contentRef={sheetContentRef}
        expandKey={selectedStoryId}
        peek={
          <MapSheetHeader
            storyCount={summary.storyCount}
            totalDistanceKm={summary.totalDistanceKm}
            totalDurationMin={summary.totalDurationMin}
            isRecording={isRecording}
            recordingDistanceKm={recordingDistanceKm}
            onToggleRecording={toggleRecording}
          />
        }
      >
        {selectedStory ? (
          <MapStoryInfo story={selectedStory} onBack={clearSelectedStory} />
        ) : (
          <StoryLineList stories={stories} onSelectStory={selectStory} />
        )}
      </BottomDrawer>
    </div>
  );
};
