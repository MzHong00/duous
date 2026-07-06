"use client";
import { useQuery } from "@tanstack/react-query";
import { Camera } from "lucide-react";
import { useRouter } from "next/navigation";

import { authQueries } from "@/features/auth/queries/authQueries";
import { storyQueries } from "@/features/stories/queries/storyQueries";
import { useCurrentWorkspace } from "@/features/workspace/hooks/useCurrentWorkspace";
import { ROUTES } from "@/constants/routes";

import { MemoryCard } from "./MemoryCard";

import styles from "./MemoryFeed.module.scss";

export const MemoryFeed = () => {
  const router = useRouter();
  const { currentWorkspace } = useCurrentWorkspace();
  const { data: user } = useQuery(authQueries.user());
  const { data: stories = [] } = useQuery(storyQueries.list(currentWorkspace?.id ?? ""));

  const handleFabClick = () => {
    router.push(ROUTES.STORIES.EDIT.path);
  };

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
        <button onClick={handleFabClick} className={styles.emptyCta}>
          + 지금 기록하기
        </button>
      </div>
    );
  }

  return (
    <div className={styles.feed}>
      {stories.map((story) => (
        <MemoryCard
          key={story.id}
          story={story}
          isMe={story.userId === user?.id}
          members={currentWorkspace?.members ?? []}
        />
      ))}
      <button onClick={handleFabClick} className={styles.fab} aria-label="기억 추가">
        +
      </button>
    </div>
  );
};
