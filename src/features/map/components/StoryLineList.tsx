"use client";
import { useMemo } from "react";
import { ChevronRight } from "lucide-react";

import { formatDate } from "@/utils/date";
import { ICON_SIZE } from "@/constants/style";
import { getStoryStats, formatDistance, formatDuration } from "@/features/stories/utils/storyStats";
import { StoryLineSpark } from "@/features/stories/components/StoryLineSpark";

import styles from "./StoryLineList.module.scss";

import type { Story } from "@/features/stories/types/story";
import type { CSSProperties } from "react";

const UNTITLED_LABEL = "제목 없는 스토리";

interface StoryLineListProps {
  stories: Story[];
  /** 목록에서 스토리를 선택 */
  onSelectStory: (storyId: string) => void;
}

/** 시트 본문의 스토리 라인 목록 — 항목마다 경로 색과 이동 기록을 함께 보여준다 */
export const StoryLineList = ({ stories, onSelectStory }: StoryLineListProps) => {
  // 항목마다 경로 통계를 계산하므로 stories가 바뀔 때만 재계산한다
  const storyItems = useMemo(
    () => stories.map((story) => ({ story, stats: getStoryStats(story) })),
    [stories]
  );

  if (storyItems.length === 0) {
    return (
      <div className={styles.empty}>
        <p className={styles.emptyTitle}>아직 남긴 경로가 없어요</p>
        <p className={styles.emptyDesc}>기록 시작을 누르면 걷는 길이 지도에 그려집니다</p>
      </div>
    );
  }

  return (
    <ul className={styles.list}>
      {storyItems.map(({ story, stats }) => (
        <li key={story.id}>
          <button
            type="button"
            onClick={() => onSelectStory(story.id)}
            className={styles.item}
            style={{ "--path-color": story.pathColor } as CSSProperties}
          >
            <span className={styles.spark}>
              <StoryLineSpark path={story.path} color={story.pathColor} />
            </span>
            <span className={styles.body}>
              <span className={styles.title}>{story.title || UNTITLED_LABEL}</span>
              <span className={styles.meta}>
                <span>{formatDate(story.date)}</span>
                <span className={styles.metaSep}>·</span>
                <span>{formatDistance(stats.distanceKm)}</span>
                <span className={styles.metaSep}>·</span>
                <span>{formatDuration(stats.durationMin)}</span>
              </span>
            </span>
            <ChevronRight size={ICON_SIZE.md} className={styles.chevron} />
          </button>
        </li>
      ))}
    </ul>
  );
};
