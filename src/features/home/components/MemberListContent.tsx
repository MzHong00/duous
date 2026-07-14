"use client";
import { ProfileImage } from "@/components/ProfileImage";

import type { WorkspaceMember } from "@/features/workspace/types/workspace";

import styles from "./MemberListContent.module.scss";

interface MemberListContentProps {
  members: WorkspaceMember[];
}

// 참여자 목록 모달에 표시되는 멤버 리스트 UI
export const MemberListContent = ({ members }: MemberListContentProps) => {
  if (members.length === 0) {
    return <p className={styles.empty}>참여자가 없어요</p>;
  }

  return (
    <ul className={styles.list}>
      {members.map((member) => (
        <li key={member.id} className={styles.row}>
          <span className={styles.avatarRing}>
            <ProfileImage uri={member.avatar} name={member.name} size={36} />
          </span>
          <div className={styles.info}>
            <p className={styles.name}>{member.name}</p>
            <p className={styles.email}>{member.email}</p>
          </div>
        </li>
      ))}
    </ul>
  );
};
