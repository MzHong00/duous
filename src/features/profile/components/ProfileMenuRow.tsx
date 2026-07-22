"use client";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";

import { cx } from "@/utils/cn";

import styles from "./ProfileView.module.scss";

import type { ProfileMenuItem } from "@/features/profile/constants/profileMenu";

const CHEVRON_ICON_SIZE = 16; // 리스트 행 우측 화살표 아이콘 크기(px)

interface ProfileMenuRowProps {
  item: ProfileMenuItem; // 렌더링할 메뉴 데이터
}

/** 알림·지원 메뉴 리스트의 단일 행 */
export const ProfileMenuRow = ({ item }: ProfileMenuRowProps) => {
  const router = useRouter();

  return (
    <button
      onClick={() => (item.onClick ? item.onClick() : router.push(item.route ?? ""))}
      className={styles.listRow}
    >
      <div className={styles.listLeft}>
        <div className={cx(styles.listIconWrap, styles[item.colorClass])}>{item.icon}</div>
        <span className={styles.listTitle}>{item.label}</span>
      </div>
      <div className={styles.listRight}>
        <span className={styles.listRightText}>{item.subText}</span>
        <ChevronRight size={CHEVRON_ICON_SIZE} color="var(--grey-300)" />
      </div>
    </button>
  );
};
