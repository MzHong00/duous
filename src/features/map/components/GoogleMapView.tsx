"use client";
import { Fragment, useEffect, useMemo } from "react";
import { GoogleMap, Polyline } from "@react-google-maps/api";

import { useGoogleMap } from "@/features/map/hooks/useGoogleMap";
import {
  MAP_CONTAINER_STYLE,
  MAP_OPTIONS,
  DEFAULT_ZOOM,
  toLatLngPath,
  getStoryLineOptions,
  getRecordingPolylineOptions,
} from "@/features/map/constants/mapConfig";
import { MapLoadState } from "@/features/map/components/MapLoadState";
import { MyLocationMarker } from "@/features/map/components/MyLocationMarker";
import { StoryEndpointMarker } from "@/features/map/components/StoryEndpointMarker";

import styles from "./GoogleMapView.module.scss";

import type { LocationPoint, Story } from "@/features/stories/types/story";
import type { WorkspaceMember } from "@/features/workspace/types/workspace";

interface GoogleMapViewProps {
  center: google.maps.LatLngLiteral;
  myMember?: WorkspaceMember;
  stories: Story[];
  recordingPath: LocationPoint[];
  isRecording: boolean;
  selectedStoryId: string | null;
  /** 스토리 경로 클릭 */
  onStoryClick: (storyId: string) => void;
}

export const GoogleMapView = ({
  center,
  myMember,
  stories,
  recordingPath,
  isRecording,
  selectedStoryId,
  onStoryClick,
}: GoogleMapViewProps) => {
  const { status, loadErrorMessage, mapRef, onMapLoad } = useGoogleMap();

  // 경로가 2개 이상인 스토리만 폴리라인으로 표시
  // path·options 객체까지 여기서 확정해, 잦은 리렌더에도 Polyline에 동일 참조를 넘겨 재적용을 막는다
  const storyPolylines = useMemo(
    () =>
      stories
        .filter((story) => story.path.length > 1)
        .map((story) => {
          const isSelected = story.id === selectedStoryId;
          const path = toLatLngPath(story.path);
          return {
            id: story.id,
            path,
            isSelected,
            color: story.pathColor,
            start: path[0],
            end: path[path.length - 1],
            ...getStoryLineOptions({
              color: story.pathColor,
              isSelected,
              hasSelection: !!selectedStoryId,
            }),
          };
        }),
    [stories, selectedStoryId]
  );

  // 선택된 스토리가 바뀌면 해당 경로의 시작 지점으로 지도 중심을 이동한다
  useEffect(() => {
    const start = stories.find((story) => story.id === selectedStoryId)?.path[0];
    if (start && mapRef.current) {
      mapRef.current.panTo({ lat: start.latitude, lng: start.longitude });
    }
  }, [selectedStoryId, stories, mapRef]);

  if (status !== "ready") {
    return <MapLoadState status={status} errorMessage={loadErrorMessage} />;
  }

  return (
    <div className={styles.wrapper}>
      <GoogleMap
        mapContainerStyle={MAP_CONTAINER_STYLE}
        center={center}
        zoom={DEFAULT_ZOOM}
        options={MAP_OPTIONS}
        onLoad={onMapLoad}
      >
        {/* 스토리 경로 — 흰 밑선 위에 컬러 선을 겹쳐 지도 배경에서 분리한다 */}
        {storyPolylines.map(({ id, path, casing, line, isSelected, color, start, end }) => (
          <Fragment key={id}>
            <Polyline path={path} options={casing} />
            <Polyline path={path} options={line} onClick={() => onStoryClick(id)} />
            {isSelected && (
              <>
                <StoryEndpointMarker lat={start.lat} lng={start.lng} color={color} isStart />
                <StoryEndpointMarker lat={end.lat} lng={end.lng} color={color} isStart={false} />
              </>
            )}
          </Fragment>
        ))}

        {/* 실시간 기록 중인 경로 (점선) */}
        {isRecording && recordingPath.length > 0 && (
          <Polyline path={toLatLngPath(recordingPath)} options={getRecordingPolylineOptions()} />
        )}

        {/* 내 위치 아바타 마커 */}
        {myMember && (
          <MyLocationMarker
            name={myMember.name}
            avatar={myMember.avatar}
            lat={center.lat}
            lng={center.lng}
          />
        )}
      </GoogleMap>
    </div>
  );
};
