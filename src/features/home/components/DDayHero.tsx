"use client";
import { useQuery } from "@tanstack/react-query";
import { Image as ImageIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef } from "react";

import { authQueries } from "@/features/auth/queries/authQueries";
import { useCurrentWorkspace } from "@/features/workspace/hooks/useCurrentWorkspace";
import { useUpdateWorkspaceBackgroundMutation } from "@/features/workspace/queries/workspaceMutations";
import { useAnniversaries } from "@/features/anniversary/hooks/useAnniversaries";
import { storageApi } from "@/api/storage";
import { ProfileImage } from "@/components/ProfileImage";
import { ROUTES } from "@/constants/routes";
import { modalActions } from "@/stores/useModalStore";
import { toastActions } from "@/stores/useToastStore";
import { cx } from "@/utils/cn";
import { calculateDDay } from "@/utils/date";
import { joinValuesWithDot } from "@/utils/format";

import { MemberListContent } from "./MemberListContent";

import styles from "./DDayHero.module.scss";

const FIRST_AVATAR_OFFSET = 0; // 첫 아바타는 겹치지 않는다
const AVATAR_OVERLAP = -10; // 이후 아바타는 왼쪽으로 겹쳐 쌓는다
const AVATAR_BASE_Z = 10; // 앞쪽 아바타가 위에 오도록 z-index 기준값

export const DDayHero = () => {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { currentWorkspace } = useCurrentWorkspace();
  const { data: user } = useQuery(authQueries.user());
  const updateBackground = useUpdateWorkspaceBackgroundMutation();
  const { anniversaries } = useAnniversaries();

  if (!currentWorkspace || !user) return null;

  const days = currentWorkspace.startDate ? calculateDDay(currentWorkspace.startDate) : 0;
  const backgroundImage = currentWorkspace.backgroundImage;
  const hasBackground = !!backgroundImage;
  const nextEvent = anniversaries[0]; // 가장 임박한 기념일
  const memberNamesString = joinValuesWithDot(currentWorkspace.members, "name", user.name);

  const handleBackgroundChange = () => {
    modalActions.showModal({
      type: "confirm",
      title: "배경 변경",
      message: "새로운 배경 이미지를 선택하시겠습니까?",
      confirmText: "선택하기",
      onConfirm: () => fileInputRef.current?.click(),
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await storageApi.uploadImage(file, user.id);
      await updateBackground.mutateAsync({ workspaceId: currentWorkspace.id, imageUrl: url });
    } catch {
      toastActions.showToast("배경 변경에 실패했어요.", "error");
    }
  };

  const handleMembersClick = () => {
    const members = currentWorkspace.members;
    if (!members?.length) return;
    modalActions.showModal({
      type: "alert",
      title: "참여자 목록",
      content: <MemberListContent members={members} />,
      confirmText: "닫기",
    });
  };

  return (
    <div className={cx(styles.wrapper, hasBackground && styles.hasBackground)}>
      {hasBackground && (
        <>
          <img src={backgroundImage} alt="배경" className={styles.bgImage} />
          <div className={styles.bgOverlay} />
        </>
      )}

      <div className={styles.content}>
        <div className={styles.topSection}>
          <div className={styles.headerRow}>
            <h1 className={styles.workspaceName}>{currentWorkspace.name}</h1>
            <p className={styles.memberNames}>{memberNamesString}</p>
          </div>
          <button onClick={handleMembersClick} className={styles.membersStack}>
            {currentWorkspace.members?.map((member, index) => (
              <div
                key={member.id}
                className={styles.memberAvatar}
                style={{
                  marginLeft: index === 0 ? FIRST_AVATAR_OFFSET : AVATAR_OVERLAP,
                  zIndex: AVATAR_BASE_Z - index,
                }}
              >
                <ProfileImage uri={member.avatar} name={member.name} size={32} />
              </div>
            ))}
          </button>
        </div>

        <div className={styles.bottomSection}>
          <div className={styles.dDayRow}>
            <div className={styles.dDayNumber}>
              <span className={styles.dDayValue}>{days}</span>
              <span className={styles.dDayUnit}>일</span>
            </div>
            <button onClick={handleBackgroundChange} className={styles.bgButton}>
              <ImageIcon size={16} />
            </button>
          </div>

          {nextEvent && (
            <button
              onClick={() => router.push(ROUTES.ANNIVERSARY.path)}
              className={styles.eventBadge}
            >
              <span className={styles.eventTitle}>{nextEvent.title} </span>
              <span className={styles.eventDDay}>D-{nextEvent.daysLeft}</span>
            </button>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className={styles.fileInput}
          onChange={handleFileChange}
        />
      </div>
    </div>
  );
};
