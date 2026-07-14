"use client";
import { Route, Square, Search } from "lucide-react";
import { cx } from "@/utils/cn";
import { useMapView } from "@/features/map/hooks/useMapView";
import { GoogleMapView } from "@/features/map/components/GoogleMapView";
import { MapEmptyState } from "@/features/map/components/MapEmptyState";
import { MapPartnerInfo } from "@/features/map/components/MapPartnerInfo";
import { MapStoryInfo } from "@/features/map/components/MapStoryInfo";
import { ProfileImage } from "@/components/ProfileImage";
import { BottomDrawer } from "@/components/BottomDrawer";

import styles from "./MapView.module.scss";

export const MapView = () => {
  const {
    currentWorkspace,
    myUserId,
    myLocation,
    isRecording,
    recordingPath,
    toggleRecording,
    stories,
    memberLocations,
    selectedStoryId,
    selectedStory,
    selectedUser,
    focusLocation,
    selectMember,
    selectStory,
    openDirections,
  } = useMapView();

  return (
    <div className={styles.page}>
      <div className={styles.memberHeader}>
        {currentWorkspace?.members?.map((member) => {
          const isSelected = selectedUser?.id === member.id;
          return (
            <button
              key={member.id}
              type="button"
              onClick={() => selectMember(member.id)}
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
        onMemberClick={selectMember}
        onStoryClick={selectStory}
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
