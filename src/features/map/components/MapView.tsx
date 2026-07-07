"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Route, Square, Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { ROUTES } from "@/constants/routes";
import { COLORS } from "@/constants/theme";
import { cx } from "@/utils/cn";
import { useCurrentWorkspace } from "@/features/workspace/hooks/useCurrentWorkspace";
import { authQueries } from "@/features/auth/queries/authQueries";
import { useStoryStore, storyActions } from "@/features/stories/stores/useStoryStore";
import { storyQueries } from "@/features/stories/queries/storyQueries";
import { useCreateStoryMutation } from "@/features/stories/queries/storyMutations";
import { toastActions } from "@/stores/useToastStore";
import { GoogleMapView } from "@/features/map/components/GoogleMapView";
import { MapEmptyState } from "@/features/map/components/MapEmptyState";
import { MapPartnerInfo } from "@/features/map/components/MapPartnerInfo";
import { MapStoryInfo } from "@/features/map/components/MapStoryInfo";
import { ProfileImage } from "@/components/ProfileImage";
import { BottomDrawer } from "@/components/BottomDrawer";
import { DEFAULT_CENTER } from "@/features/map/constants/mapConfig";

import type { WorkspaceMember } from "@/features/workspace/types/workspace";
import styles from "./MapView.module.scss";

const GEO_WATCH_OPTIONS: PositionOptions = { enableHighAccuracy: true, maximumAge: 5000 };
const DIRECTIONS_BASE_URL = "https://www.google.com/maps/dir/?api=1";
const MIN_PATH_POINTS = 2; // 스토리로 저장 가능한 최소 정점 수

export const MapView = () => {
  const router = useRouter();
  const { currentWorkspace } = useCurrentWorkspace();
  const { data: user } = useQuery(authQueries.user());
  const { data: stories = [] } = useQuery(storyQueries.list(currentWorkspace?.id ?? ""));
  const createStory = useCreateStoryMutation(currentWorkspace?.id ?? "");
  const selectedStoryId = useStoryStore((s) => s.selectedStoryId);
  const isRecording = useStoryStore((s) => s.isRecording);
  const recordingPath = useStoryStore((s) => s.recordingPath);

  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [myLocation, setMyLocation] = useState(DEFAULT_CENTER);
  const [focusLocation, setFocusLocation] = useState<{ lat: number; lng: number } | null>(null);
  const watchIdRef = useRef<number | null>(null);

  const myUserId = user?.id ?? "";

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setMyLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setMyLocation(DEFAULT_CENTER)
    );
  }, []);

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

  const stopWatchPosition = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      stopWatchPosition();
    };
  }, [stopWatchPosition]);

  const memberLocations = (currentWorkspace?.members ?? []).flatMap<{
    member: WorkspaceMember;
    lat: number;
    lng: number;
  }>((member) => {
    // 실시간 위치 공유(presence) 연동 전까지는 본인 위치만 표시한다
    if (member.id !== myUserId) return [];
    return [{ member, lat: myLocation.lat, lng: myLocation.lng }];
  });

  const mapCenter = myLocation;
  const selectedStory = stories.find((s) => s.id === selectedStoryId);
  const selectedUser = currentWorkspace?.members?.find((m) => m.id === selectedUserId);

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
        userId: myUserId,
        workspaceId: currentWorkspace?.id ?? "",
      });
      storyActions.clearRecording();
      toastActions.showToast("새로운 스토리가 기록되었습니다!", "success");
      router.push(ROUTES.STORIES.EDIT.query({ storyId: created.id }));
    } catch {
      storyActions.stopRecording();
      toastActions.showToast("스토리 저장에 실패했습니다. 다시 시도해주세요.", "error");
    }
  };

  const openDirections = () => {
    const partner = memberLocations.find((m) => m.member.id !== myUserId);
    if (!partner) return;
    const url = `${DIRECTIONS_BASE_URL}&destination=${partner.lat},${partner.lng}&travelmode=driving`;
    window.open(url, "_blank");
  };

  return (
    <div className={styles.page}>
      <div className={styles.memberHeader}>
        {currentWorkspace?.members?.map((member) => {
          const isSelected = selectedUserId === member.id;
          return (
            <button
              key={member.id}
              type="button"
              onClick={() => {
                const loc = memberLocations.find((m) => m.member.id === member.id);
                if (loc) setFocusLocation({ lat: loc.lat, lng: loc.lng });
                setSelectedUserId(isSelected ? null : member.id);
                storyActions.setSelectedStoryId(null);
              }}
              className={cx(styles.memberButton, isSelected && styles.memberButtonActive)}
            >
              <div className={cx(styles.memberAvatarWrap, isSelected && styles.memberAvatarActive)}>
                <ProfileImage uri={member.avatar} name={member.name} size={52} />
                <span className={styles.focusBadge}>
                  <Search size={10} strokeWidth={2.5} />
                </span>
              </div>
              <span className={cx(styles.memberName, isSelected && styles.memberNameActive)}>
                {member.name}
              </span>
            </button>
          );
        })}
      </div>

      <GoogleMapView
        center={mapCenter}
        focusLocation={focusLocation}
        myUserId={myUserId}
        memberLocations={memberLocations}
        stories={stories}
        recordingPath={recordingPath}
        isRecording={isRecording}
        selectedStoryId={selectedStoryId}
        onMemberClick={(memberId) => {
          setSelectedUserId((prev) => (prev === memberId ? null : memberId));
          storyActions.setSelectedStoryId(null);
        }}
        onStoryClick={(storyId) => {
          storyActions.setSelectedStoryId(storyId);
          setSelectedUserId(null);
        }}
      />

      <div className={styles.recordFab}>
        <button
          type="button"
          onClick={toggleRecording}
          className={cx(
            styles.recordButton,
            isRecording ? styles.recordButtonActive : styles.recordButtonIdle
          )}
        >
          {isRecording ? (
            <>
              <Square size={14} fill="white" color="white" />
              <span className={styles.recordLabel}>스토리 기록 종료</span>
            </>
          ) : (
            <>
              <Route size={14} />
              <span className={styles.recordLabel}>스토리 기록 시작</span>
            </>
          )}
        </button>
      </div>

      <BottomDrawer>
        {selectedStory ? (
          <MapStoryInfo story={selectedStory} />
        ) : selectedUser ? (
          <MapPartnerInfo
            member={selectedUser}
            onOpenDirections={openDirections}
            recentPlaces={[]}
          />
        ) : (
          <MapEmptyState />
        )}
      </BottomDrawer>
    </div>
  );
};
