"use client";
import { useState } from "react";
import { Route, Square, Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { cx } from "@/utils/cn";
import { useCurrentWorkspace } from "@/features/workspace/hooks/useCurrentWorkspace";
import { authQueries } from "@/features/auth/queries/authQueries";
import { useStoryStore, storyActions } from "@/features/stories/stores/useStoryStore";
import { storyQueries } from "@/features/stories/queries/storyQueries";
import { useStoryRecording } from "@/features/map/hooks/useStoryRecording";
import { GoogleMapView } from "@/features/map/components/GoogleMapView";
import { MapEmptyState } from "@/features/map/components/MapEmptyState";
import { MapPartnerInfo } from "@/features/map/components/MapPartnerInfo";
import { MapStoryInfo } from "@/features/map/components/MapStoryInfo";
import { ProfileImage } from "@/components/ProfileImage";
import { BottomDrawer } from "@/components/BottomDrawer";
import { toastActions } from "@/stores/useToastStore";

import type { MemberLocation } from "@/features/map/types/map";
import styles from "./MapView.module.scss";

const DIRECTIONS_BASE_URL = "https://www.google.com/maps/dir/?api=1";

export const MapView = () => {
  const { currentWorkspace } = useCurrentWorkspace();
  const { data: user } = useQuery(authQueries.user());
  const { data: stories = [] } = useQuery(storyQueries.list(currentWorkspace?.id ?? ""));
  const selectedStoryId = useStoryStore((s) => s.selectedStoryId);

  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [focusLocation, setFocusLocation] = useState<{ lat: number; lng: number } | null>(null);

  const myUserId = user?.id ?? "";
  const { myLocation, isRecording, recordingPath, toggleRecording } = useStoryRecording({
    workspaceId: currentWorkspace?.id ?? "",
    userId: myUserId,
  });

  const memberLocations = (currentWorkspace?.members ?? []).flatMap<MemberLocation>((member) => {
    // 실시간 위치 공유(presence) 연동 전까지는 본인 위치만 표시한다
    if (member.id !== myUserId) return [];
    return [{ member, lat: myLocation.lat, lng: myLocation.lng }];
  });

  const selectedStory = stories.find((s) => s.id === selectedStoryId);
  const selectedUser = currentWorkspace?.members?.find((m) => m.id === selectedUserId);

  const openDirections = () => {
    const partner = memberLocations.find((m) => m.member.id !== myUserId);
    if (!partner) {
      toastActions.showToast("상대방의 위치를 아직 확인할 수 없어요.", "error");
      return;
    }
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
        center={myLocation}
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
