"use client";
import { useRouter } from "next/navigation";

import { cx } from "@/utils/cn";

import styles from "./ProfileView.module.scss";

import type { QuickActionItem } from "@/features/profile/constants/profileMenu";

interface QuickActionButtonProps {
  item: QuickActionItem; // 렌더링할 퀵 액션 데이터
}

/** 프로필 상단 퀵 액션 그리드의 단일 버튼 */
export const QuickActionButton = ({ item }: QuickActionButtonProps) => {
  const router = useRouter();

  return (
    <button onClick={() => router.push(item.route)} className={styles.gridItem}>
      <div className={cx(styles.gridIconWrap, styles[item.colorClass])}>{item.icon}</div>
      <span className={styles.gridLabel}>{item.label}</span>
    </button>
  );
};
