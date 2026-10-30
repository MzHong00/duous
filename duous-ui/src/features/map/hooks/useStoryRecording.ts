"use client";
import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";

import { ROUTES } from "@/constants/routes";
import { COLORS } from "@/constants/theme";
import { useStoryStore, storyActions } from "@/features/stories/stores/useStoryStore";
import { useCreateStoryMutation } from "@/features/stories/queries/storyMutations";
import { toastActions } from "@/stores/useToastStore";
import { DEFAULT_CENTER } from "@/features/map/constants/mapConfig";

import type { LocationPoint } from "@/features/stories/types/story";

const GEO_WATCH_OPTIONS: PositionOptions = { enableHighAccuracy: true, maximumAge: 5000 };
const MIN_PATH_POINTS = 2; // 스토리로 저장 가능한 최소 정점 수

interface UseStoryRecordingParams {
  workspaceId: string; // 스토리를 저장할 워크스페이스 ID
  userId: string; // 기록 주체 사용자 ID
}

interface UseStoryRecordingResult {
  myLocation: { lat: number; lng: number }; // 현재 내 위치
  isRecording: boolean; // 실시간 위치 기록 진행 여부
  recordingPath: LocationPoint[]; // 기록 중인 경로
  toggleRecording: () => Promise<void>; // 기록 시작/종료를 토글한다
}

/**
 * 실시간 위치 추적과 스토리 기록 시작/종료 로직을 캡슐화하는 커스텀 훅.
 * 지오로케이션 watch 생명주기와 스토리 저장 뮤테이션 호출을 담당한다.
 */
export const useStoryRecording = ({
  workspaceId,
  userId,
}: UseStoryRecordingParams): UseStoryRecordingResult => {
  const router = useRouter();
  const watchIdRef = useRef<number | null>(null);

  const [myLocation, setMyLocation] = useState(DEFAULT_CENTER);

  const createStory = useCreateStoryMutation(workspaceId);
  const isRecording = useStoryStore((s) => s.isRecording);
  const recordingPath = useStoryStore((s) => s.recordingPath);

  /** 지오로케이션 watch를 시작해 위치 변화를 경로에 누적하고 내 위치를 갱신한다 */
  const startWatchPosition = useCallback(() => {
    if (!navigator.geolocation) {
      toastActions.showToast("이 기기에서는 위치 기록을 지원하지 않습니다.", "error");
      return;
    }
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        storyActions.addLocationPoint({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          timestamp: pos.timestamp,
        });
        setMyLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          toastActions.showToast("위치 권한이 필요합니다. 설정에서 허용해주세요.", "error");
          storyActions.stopRecording();
        }
      },
      GEO_WATCH_OPTIONS
    );
  }, []);

  /** 진행 중인 지오로케이션 watch를 해제한다 */
  const stopWatchPosition = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  /** 마운트 시 현재 위치를 1회 조회해 초기 지도 중심으로 사용한다(실패 시 기본 중심 유지) */
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setMyLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setMyLocation(DEFAULT_CENTER)
    );
  }, []);

  // 새로고침 등으로 마운트될 때 기록 상태(isRecording)가 이미 true라면(persist 복원) 위치 추적을 재개한다
  useEffect(() => {
    if (isRecording) {
      startWatchPosition();
    }
    return () => {
      stopWatchPosition();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** 기록 시작/종료를 토글한다. 종료 시 경로가 충분하면 스토리로 저장 후 편집 화면으로 이동한다 */
  const toggleRecording = async () => {
    if (!isRecording) {
      storyActions.startRecording();
      startWatchPosition();
      toastActions.showToast("실시간 위치 기록을 시작합니다.", "info");
      return;
    }

    stopWatchPosition();
    if (recordingPath.length < MIN_PATH_POINTS) {
      toastActions.showToast("기록된 경로가 너무 짧아 저장할 수 없습니다.", "error");
      storyActions.stopRecording();
      return;
    }

    try {
      const created = await createStory.mutateAsync({
        date: new Date().toISOString(),
        path: recordingPath,
        pathColor: COLORS.primary,
        userId,
        workspaceId,
      });
      storyActions.clearRecording();
      toastActions.showToast("새로운 스토리가 기록되었습니다!", "success");
      router.push(ROUTES.STORIES.EDIT.query({ storyId: created.id }));
    } catch {
      storyActions.stopRecording();
      toastActions.showToast("스토리 저장에 실패했습니다. 다시 시도해주세요.", "error");
    }
  };

  return { myLocation, isRecording, recordingPath, toggleRecording };
};
