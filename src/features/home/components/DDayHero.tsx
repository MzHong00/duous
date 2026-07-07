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
          <img src={backgroundImage} alt="" className={styles.bgImage} />
          <div className={styles.bgOverlay} />
        </>
      )}

      <div className={styles.content}>
        <div className={styles.topSection}>
          <div className={styles.headerRow}>
            <h1 className={styles.workspaceName}>{currentWorkspace.name}</h1>
            <p className={styles.memberNames}>{memberNamesString}</p>
          </div>
          <button
            type="button"
            onClick={handleMembersClick}
            className={styles.membersStack}
            aria-label={`참여자 ${currentWorkspace.members?.length ?? 0}명 보기`}
          >
            {/* row-reverse로 렌더링해 DOM 뒤쪽(=원래 첫 멤버)이 자연스럽게 맨 위로 쌓이게 한다 */}
            {[...(currentWorkspace.members ?? [])].reverse().map((member) => (
              <div key={member.id} className={styles.memberAvatar}>
                <ProfileImage uri={member.avatar} name={member.name} size={32} />
              </div>
            ))}
          </button>
        </div>

        <div className={styles.bottomSection}>
          <div className={styles.dDayRow}>
            <div className={styles.dDayNumber} aria-label={`함께한 지 ${days}일째`}>
              <span className={styles.dDayValue} aria-hidden="true">
                {days}
              </span>
              <span className={styles.dDayUnit} aria-hidden="true">
                일
              </span>
            </div>
            <button
              type="button"
              onClick={handleBackgroundChange}
              className={styles.bgButton}
              aria-label="배경 이미지 변경"
            >
              <ImageIcon size={16} />
            </button>
          </div>

          {nextEvent && (
            <button
              type="button"
              onClick={() => router.push(ROUTES.ANNIVERSARY.path)}
              className={styles.eventBadge}
              aria-label={`가장 가까운 기념일 ${nextEvent.title}, D-${nextEvent.daysLeft}, 자세히 보기`}
            >
              <span className={styles.eventTitle}>{nextEvent.title}</span>
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
