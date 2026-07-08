"use client";
import { useRouter } from "next/navigation";
import { Users, ChevronRight } from "lucide-react";

import { ProfileImage } from "@/components/ProfileImage";
import { ROUTES } from "@/constants/routes";
import { useCurrentWorkspace } from "@/features/workspace/hooks/useCurrentWorkspace";

import styles from "./ProfileQuickCards.module.scss";

const MEMBER_AVATAR_SIZE = 26; // 멤버 아바타 스택 크기(px)
const MEMBER_STACK_MAX = 4; // 아바타 스택 최대 노출 인원

/** 프로필 상단 라이프룸 정보 로우 (실데이터 노출 위젯) */
export const ProfileQuickCards = () => {
  const router = useRouter();
  const { currentWorkspace } = useCurrentWorkspace();

  const members = currentWorkspace?.members ?? [];
  const visibleMembers = members.slice(0, MEMBER_STACK_MAX);
  const restMemberCount = members.length - visibleMembers.length;

  return (
    <button onClick={() => router.push(ROUTES.WORKSPACE.LIST.path)} className={styles.roomRow}>
      <div className={styles.iconWrap} data-color="orange">
        <Users size={18} />
      </div>

      <div className={styles.roomInfo}>
        <span className={styles.cardLabel}>라이프룸</span>
        {currentWorkspace ? (
          <span className={styles.cardTitle}>{currentWorkspace.name}</span>
        ) : (
          <span className={styles.cardEmpty}>라이프룸을 만들어보세요</span>
        )}
      </div>

      {currentWorkspace && members.length > 0 && (
        <div className={styles.memberRow}>
          <div className={styles.memberStack}>
            {[...visibleMembers].reverse().map((member) => (
              <div key={member.id} className={styles.memberAvatar}>
                <ProfileImage uri={member.avatar} name={member.name} size={MEMBER_AVATAR_SIZE} />
              </div>
            ))}
          </div>
          {restMemberCount > 0 && <span className={styles.memberCount}>+{restMemberCount}</span>}
        </div>
      )}

      <ChevronRight size={18} className={styles.chevron} />
    </button>
  );
};
