"use client";
import { useMemo } from "react";

import { LayoutGrid } from "lucide-react";

import type { Story } from "@/features/stories/types/story";

import styles from "./StoryBoardHeader.module.scss";

interface StoryBoardHeaderProps {
  stories: Story[]; // 통계 계산용 실 스토리 목록(껍데기 제외)
  onListClick: () => void; // 목록 화면으로 이동
}

/** 스토리 보드 상단 플로팅 오버레이: 총 개수·이번 달 등록 통계 + 목록 이동 버튼 */
export const StoryBoardHeader = ({ stories, onListClick }: StoryBoardHeaderProps) => {
  const thisMonthCount = useMemo(() => {
    const now = new Date();
    return stories.filter((story) => {
      const storyDate = new Date(story.date);
      return (
        storyDate.getFullYear() === now.getFullYear() && storyDate.getMonth() === now.getMonth()
      );
    }).length;
  }, [stories]);

  return (
    <header className={styles.overlay}>
      <div className={styles.stats}>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>총 스토리</span>
          <span className={styles.statValue}>{stories.length}개</span>
        </div>
        <div className={styles.divider} />
        <div className={styles.statItem}>
          <span className={styles.statLabel}>이번달</span>
          <span className={styles.statValue}>{thisMonthCount}개</span>
        </div>
      </div>
      <button
        type="button"
        onClick={onListClick}
        className={styles.listButton}
        aria-label="스토리 목록 보기"
      >
        <LayoutGrid size={18} />
      </button>
    </header>
  );
};
