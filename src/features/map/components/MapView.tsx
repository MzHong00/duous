"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Route, Square, Search } from "lucide-react";
import { useWorkspaceStore } from "@/features/workspace/stores/useWorkspaceStore";
import { useQuery } from "@tanstack/react-query";
import { authQueries } from "@/features/auth/queries/authQueries";
import { useStoryStore, storyActions } from "@/features/stories/stores/useStoryStore";
import { toastActions } from "@/shared/stores/useToastStore";
import { GoogleMapView } from "@/features/map/components/GoogleMapView";
import { MapEmptyState } from "@/features/map/components/MapEmptyState";
import { MapPartnerInfo } from "@/features/map/components/MapPartnerInfo";
import { MapStoryInfo } from "@/features/map/components/MapStoryInfo";
import { ProfileImage } from "@/shared/components/ProfileImage";
import type { WorkspaceMember } from "@/features/workspace/types/workspace";
import { BottomDrawer } from "@/shared/components/BottomDrawer";
import styles from "./MapView.module.scss";

const DEFAULT_CENTER = { lat: 37.5665, lng: 126.978 };
const MOCK_MEMBER_LOCATION_MAP: Record<string, { lat: number; lng: number }> = {
  "user-2": { lat: 37.5, lng: 127.03 },
};
const RECENT_PLACES = [
  { id: "1", name: "명동 성당 카페", date: "어제 오후 2:00" },
  { id: "2", name: "남산 타워", date: "3일 전" },
  { id: "3", name: "강남구청 역 이자카야", date: "지난 주말" },
];

export const MapView = () => {
  const router = useRouter();
  const currentWorkspace = useWorkspaceStore((s) => s.currentWorkspace);
  const { data: user } = useQuery(authQueries.user());
  const stories = useStoryStore((s) => s.stories);
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
      { enableHighAccuracy: true, maximumAge: 5000 }
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

  const memberLocations = (currentWorkspace?.members ?? [])
    .map((member) => {
      if (member.id === myUserId) {
        const loc = myLocation;
        return { member, lat: loc.lat, lng: loc.lng };
      }
      const loc = MOCK_MEMBER_LOCATION_MAP[member.id];
      if (!loc) return null;
      return { member, lat: loc.lat, lng: loc.lng };
    })
    .filter(Boolean) as { member: WorkspaceMember; lat: number; lng: number }[];

  const mapCenter = myLocation;
  const selectedStory = stories.find((s) => s.id === selectedStoryId);
  const selectedUser = currentWorkspace?.members?.find((m) => m.id === selectedUserId);

  const toggleRecording = () => {
    if (!isRecording) {
      storyActions.startRecording();
      startWatchPosition();
      toastActions.showToast("실시간 위치 기록을 시작합니다.", "info");
    } else {
      stopWatchPosition();
      if (recordingPath.length < 2) {
        toastActions.showToast("기록된 경로가 너무 짧아 저장할 수 없습니다.", "error");
        storyActions.stopRecording();
        return;
      }
      const newStoryId = `story-${Date.now()}`;
      storyActions.saveStory({
        id: newStoryId,
        userId: myUserId,
        workspaceId: currentWorkspace?.id || "",
        pathColor: "#3182F6",
      });
      toastActions.showToast("새로운 스토리가 기록되었습니다!", "success");
      router.push(`/stories/edit?storyId=${newStoryId}`);
    }
  };

  const openDirections = () => {
    const partner = memberLocations.find((m) => m.member.id !== myUserId);
    if (!partner) return;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${partner.lat},${partner.lng}&travelmode=driving`;
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
              className={[styles.memberButton, isSelected && styles.memberButtonActive]
                .filter(Boolean)
                .join(" ")}
            >
              <div
                className={[styles.memberAvatarWrap, isSelected && styles.memberAvatarActive]
                  .filter(Boolean)
                  .join(" ")}
              >
                <ProfileImage uri={member.avatar} name={member.name} size={52} />
                <span className={styles.focusBadge}>
                  <Search size={10} strokeWidth={2.5} />
                </span>
              </div>
              <span
                className={[styles.memberName, isSelected && styles.memberNameActive]
                  .filter(Boolean)
                  .join(" ")}
              >
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
          className={[
            styles.recordButton,
            isRecording ? styles.recordButtonActive : styles.recordButtonIdle,
          ]
            .filter(Boolean)
            .join(" ")}
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
            recentPlaces={RECENT_PLACES}
          />
        ) : (
          <MapEmptyState />
        )}
      </BottomDrawer>
    </div>
  );
};
