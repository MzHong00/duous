"use client";
import { ChevronLeft } from "lucide-react";

import { ICON_SIZE } from "@/constants/style";
import { StoryDetailContent } from "@/features/stories/components/StoryDetailContent";

import styles from "./MapStoryInfo.module.scss";

import type { Story } from "@/features/stories/types/story";

interface MapStoryInfoProps {
  story: Story;
  /** 목록으로 돌아가기 */
  onBack: () => void;
}

/**
 * 지도 시트에서 보여주는 스토리 상세.
 * 본문은 스토리 상세 페이지와 같은 StoryDetailContent를 그대로 쓰고, 목록으로 돌아가는 길만 덧붙인다.
 */
export const MapStoryInfo = ({ story, onBack }: MapStoryInfoProps) => {
  return (
    <div className={styles.container}>
      <button type="button" onClick={onBack} className={styles.backButton}>
        <ChevronLeft size={ICON_SIZE.md} />
        목록으로
      </button>

      <StoryDetailContent story={story} shouldShowMapAction={false} />
    </div>
  );
};
