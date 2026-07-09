"use client";
import { useQuery } from "@tanstack/react-query";

import { authQueries } from "@/features/auth/queries/authQueries";
import { useCurrentWorkspace } from "@/features/workspace/hooks/useCurrentWorkspace";
import { ProfileImage } from "@/components/ProfileImage";
import { MemberListContent } from "./MemberListContent";
import { modalActions } from "@/stores/useModalStore";
import { calculateDDay } from "@/utils/date";

import { ActivityDashboard } from "./ActivityDashboard";
import { AnniversarySpotlight } from "./AnniversarySpotlight";
import { UpcomingDigest } from "./UpcomingDigest";

import styles from "./MemoryFeed.module.scss";

/** 홈 화면 본문: 프레임리스 헤더 + 기념일 스포트라이트 + 일정·할 일 다이제스트 + 활동 대시보드 */
export const MemoryFeed = () => {
  const { currentWorkspace } = useCurrentWorkspace();
  const { data: user } = useQuery(authQueries.user());

  if (!currentWorkspace || !user) return null;

  const days = currentWorkspace.startDate ? calculateDDay(currentWorkspace.startDate) : 0;

  /** 참여자 아바타 스택 클릭 시 참여자 목록 모달 표시 */
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
    <div className={styles.feed}>
      <div className={styles.board}>
        {/* 상단 프레임리스 헤더: 워크스페이스명 + 그라데이션 D-day + 참여자 아바타 스택 */}
        <header className={styles.header}>
          <div className={styles.headerInfo}>
            <span className={styles.workspaceName}>{currentWorkspace.name}</span>
            <div className={styles.dDayRow}>
              <span className={styles.dDayPrefix}>함께한 지</span>
              <span className={styles.dDayValue}>{days}</span>
              <span className={styles.dDayUnit}>일</span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleMembersClick}
            className={styles.membersStack}
            aria-label={`참여자 ${currentWorkspace.members?.length ?? 0}명 보기`}
          >
            {[...(currentWorkspace.members ?? [])].reverse().map((member) => (
              <div key={member.id} className={styles.memberAvatar}>
                <ProfileImage uri={member.avatar} name={member.name} size={28} />
              </div>
            ))}
          </button>
        </header>

        {/* 중앙 스크롤 영역: 인사말 + 기념일 스포트라이트 + 일정·할 일 다이제스트 + 활동 대시보드 */}
        <div className={styles.content}>
          <AnniversarySpotlight />
          <UpcomingDigest />
          <ActivityDashboard />
        </div>
      </div>
    </div>
  );
};
