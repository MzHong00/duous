"use client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Map, MapPin, Plus } from "lucide-react";

import { ROUTES } from "@/constants/routes";
import { storyActions } from "@/features/stories/stores/useStoryStore";
import { isShellStory } from "@/features/stories/constants/previewMockStories";
import { formatDate } from "@/utils/date";
import { ICON_SIZE } from "@/constants/style";
import { StoryLineSpark } from "@/features/stories/components/StoryLineSpark";
import { getStoryStats, formatDistance, formatDuration } from "@/features/stories/utils/storyStats";

import styles from "./StoryDetailContent.module.scss";

import type { Story } from "@/features/stories/types/story";
import type { CSSProperties } from "react";

interface StoryDetailContentProps {
  story: Story;
  /** 지도로 이동하는 액션 노출 여부 — 지도 화면에서 이미 경로를 보고 있을 때는 숨긴다 */
  shouldShowMapAction?: boolean;
}

/**
 * 스토리 상세 본문(히어로 이미지·날짜·제목·경로 기록·설명·지도 보기 버튼).
 * 상세 페이지·홈 피드 오버레이·지도 시트가 동일한 상세 UI를 공유하기 위한 프레젠테이션 컴포넌트.
 */
export const StoryDetailContent = ({
  story,
  shouldShowMapAction = true,
}: StoryDetailContentProps) => {
  const router = useRouter();
  const isShell = isShellStory(story); // 예시(껍데기) 스토리 여부
  const stats = getStoryStats(story); // 경로에서 계산한 이동 거리·소요 시간·지점 수

  const handleShowOnMap = () => {
    storyActions.setSelectedStoryId(story.id);
    router.push(ROUTES.MAP.path);
  };

  const handleCreate = () => {
    router.push(ROUTES.STORIES.EDIT.path);
  };

  return (
    <div className={styles.content}>
      {story.thumbnailUrl ? (
        <div className={styles.imageWrap}>
          <Image
            src={story.thumbnailUrl}
            alt=""
            fill
            sizes="100vw"
            className={styles.photo}
            draggable={false}
          />
        </div>
      ) : (
        <div className={styles.placeholder}>
          <MapPin size={ICON_SIZE["4xl"]} className={styles.placeholderIcon} />
        </div>
      )}

      <div className={styles.details}>
        <div className={styles.metaRow}>
          {formatDate(story.date) && <span className={styles.date}>{formatDate(story.date)}</span>}
        </div>

        <h1 className={styles.title}>{story.title || "제목 없음"}</h1>

        {story.path.length > 0 && (
          <div
            className={styles.pathSummary}
            style={{ "--path-color": story.pathColor } as CSSProperties}
          >
            <span className={styles.pathSpark}>
              <StoryLineSpark path={story.path} color={story.pathColor} />
            </span>
            <dl className={styles.pathStats}>
              <div className={styles.pathStat}>
                <dd className={styles.pathStatValue}>{formatDistance(stats.distanceKm)}</dd>
                <dt className={styles.pathStatLabel}>이동 거리</dt>
              </div>
              <div className={styles.pathStat}>
                <dd className={styles.pathStatValue}>{formatDuration(stats.durationMin)}</dd>
                <dt className={styles.pathStatLabel}>소요 시간</dt>
              </div>
              <div className={styles.pathStat}>
                <dd className={styles.pathStatValue}>{`${stats.pointCount}개`}</dd>
                <dt className={styles.pathStatLabel}>기록 지점</dt>
              </div>
            </dl>
          </div>
        )}

        {story.description && <p className={styles.description}>{story.description}</p>}

        {isShell && (
          <>
            <p className={styles.shellNote}>
              아직 기록되지 않은 예시 카드예요. 우리만의 기억을 남겨 이 자리를 채워보세요.
            </p>
            <button onClick={handleCreate} className={styles.mapButton}>
              <span className={styles.mapIconWrap}>
                <Plus size={ICON_SIZE.lg} />
              </span>
              <span className={styles.mapLabel}>직접 기억 기록하기</span>
            </button>
          </>
        )}

        {!isShell && shouldShowMapAction && (
          <button onClick={handleShowOnMap} className={styles.mapButton}>
            <span className={styles.mapIconWrap}>
              <Map size={ICON_SIZE.lg} />
            </span>
            <span className={styles.mapLabel}>지도에서 경로 보기</span>
          </button>
        )}
      </div>
    </div>
  );
};
