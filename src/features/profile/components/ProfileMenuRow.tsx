"use client";
import { useRouter } from "next/navigation";

import styles from "./ProfileView.module.scss";

import type { ProfileMenuItem } from "@/features/profile/constants/profileMenu";

interface ProfileMenuRowProps {
  item: ProfileMenuItem; // 렌더링할 메뉴 데이터
}

/** 알림·지원 메뉴 리스트의 단일 행 */
export const ProfileMenuRow = ({ item }: ProfileMenuRowProps) => {
  const router = useRouter();

  return (
    <button onClick={() => router.push(item.route)} className={styles.listRow}>
      <div className={styles.listLeft}>
        <div className={styles.listIconWrap}>{item.icon}</div>
        <span className={styles.listTitle}>{item.label}</span>
      </div>
      <span className={styles.listRightText}>{item.subText}</span>
    </button>
  );
};
