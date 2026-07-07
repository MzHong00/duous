"use client";
import { useQuery } from "@tanstack/react-query";
import { Camera, RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";

import { authQueries } from "@/features/auth/queries/authQueries";
import { storyQueries } from "@/features/stories/queries/storyQueries";
import { useCurrentWorkspace } from "@/features/workspace/hooks/useCurrentWorkspace";
import { ROUTES } from "@/constants/routes";

import { MemoryCard } from "./MemoryCard";

import styles from "./MemoryFeed.module.scss";

const SKELETON_KEYS = ["skeleton-1", "skeleton-2", "skeleton-3"]; // 로딩 스켈레톤 카드 개수(3장)

export const MemoryFeed = () => {
  const router = useRouter();
  const { currentWorkspace } = useCurrentWorkspace();
  const { data: user } = useQuery(authQueries.user());
  const {
    data: stories = [],
    isPending: isStoriesPending,
    isError: isStoriesError,
    refetch: refetchStories,
  } = useQuery(storyQueries.list(currentWorkspace?.id ?? ""));

  const handleFabClick = () => {
    router.push(ROUTES.STORIES.EDIT.path);
  };

  // 로딩 중에는 빈 상태로 오탐하지 않도록 스켈레톤을 먼저 보여준다
  if (isStoriesPending) {
    return (
      <div className={styles.feed}>
        <h2 className={styles.feedTitle}>우리의 기억</h2>
        {SKELETON_KEYS.map((key) => (
          <div key={key} className={styles.skeletonCard} aria-hidden="true" />
        ))}
      </div>
    );
  }

  if (isStoriesError) {
    return (
      <div className={styles.emptyState}>
        <Camera size={48} className={styles.emptyIcon} />
        <p className={styles.errorTitle}>기억을 불러오지 못했어요</p>
        <p className={styles.errorSub}>
          네트워크 상태를 확인한 뒤
          <br />
          다시 시도해주세요.
        </p>
        <button type="button" onClick={() => refetchStories()} className={styles.errorRetry}>
          <RotateCcw size={14} />
          다시 시도
        </button>
      </div>
    );
  }

  if (stories.length === 0) {
    return (
      <div className={styles.emptyState}>
        <Camera size={48} className={styles.emptyIcon} />
        <p className={styles.emptyTitle}>첫 번째 기억을 남겨보세요</p>
        <p className={styles.emptySub}>
          오늘 함께한 순간을 사진 한 장으로 기록하면
          <br />
          언제든 다시 꺼내볼 수 있어요.
        </p>
        <button type="button" onClick={handleFabClick} className={styles.emptyCta}>
          + 지금 기록하기
        </button>
      </div>
    );
  }

  return (
    <div className={styles.feed}>
      <h2 className={styles.feedTitle}>우리의 기억</h2>
      {stories.map((story) => (
        <MemoryCard
          key={story.id}
          story={story}
          isMe={story.userId === user?.id}
          members={currentWorkspace?.members ?? []}
        />
      ))}
      <button type="button" onClick={handleFabClick} className={styles.fab} aria-label="기억 추가">
        +
      </button>
    </div>
  );
};
