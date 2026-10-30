"use client";
import { useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { useCurrentWorkspace } from "@/features/workspace/hooks/useCurrentWorkspace";
import { authQueries } from "@/features/auth/queries/authQueries";
import { useStoryStore, storyActions } from "@/features/stories/stores/useStoryStore";
import { storyQueries } from "@/features/stories/queries/storyQueries";
import { useStoryRecording } from "@/features/map/hooks/useStoryRecording";
import { getStoriesSummary, getPathDistanceKm } from "@/features/stories/utils/storyStats";

/**
 * 지도 화면의 워크스페이스/스토리 선택 상태와 본인 위치 기록 로직을 캡슐화하는 커스텀 훅.
 * MapView 컴포넌트는 이 훅이 제공하는 상태와 핸들러로 렌더링만 담당한다.
 */
export const useMapView = () => {
  const { currentWorkspace } = useCurrentWorkspace();
  const { data: user } = useQuery(authQueries.user());
  const { data: stories = [] } = useQuery(storyQueries.list(currentWorkspace?.id ?? ""));
  const selectedStoryId = useStoryStore((s) => s.selectedStoryId);

  const myUserId = user?.id ?? "";
  const { myLocation, isRecording, recordingPath, toggleRecording } = useStoryRecording({
    workspaceId: currentWorkspace?.id ?? "",
    userId: myUserId,
  });

  const selectedStory = stories.find((s) => s.id === selectedStoryId);
  // 시트 상단 요약 — 스토리 목록이 바뀔 때만 다시 집계한다
  const summary = useMemo(() => getStoriesSummary(stories), [stories]);
  // 기록 중에는 지금까지 걸은 거리를 실시간으로 보여준다
  const recordingDistanceKm = useMemo(() => getPathDistanceKm(recordingPath), [recordingPath]);
  const myMember = currentWorkspace?.members?.find((m) => m.id === myUserId);

  /** 스토리 경로 클릭 시 선택 상태를 갱신 */
  const selectStory = useCallback((storyId: string) => {
    storyActions.setSelectedStoryId(storyId);
  }, []);

  /** 스토리 상세를 닫고 목록으로 돌아간다 */
  const clearSelectedStory = useCallback(() => {
    storyActions.setSelectedStoryId(null);
  }, []);

  return {
    currentWorkspace,
    myUserId,
    myMember,
    myLocation,
    isRecording,
    recordingPath,
    toggleRecording,
    stories,
    summary,
    recordingDistanceKm,
    selectedStoryId,
    selectedStory,
    selectStory,
    clearSelectedStory,
  };
};
