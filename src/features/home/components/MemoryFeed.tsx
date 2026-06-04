"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Camera } from "lucide-react";

import { useStoryStore, storyActions } from "@/features/stories/stores/useStoryStore";
import { useWorkspaceStore } from "@/features/workspace/stores/useWorkspaceStore";
import { useQuery } from "@tanstack/react-query";
import { authQueries } from "@/features/auth/queries/authQueries";
import { storiesApi } from "@/features/stories/api/stories";
import { MemoryCard } from "./MemoryCard";
import styles from "./MemoryFeed.module.scss";

export const MemoryFeed = () => {
  const router = useRouter();
  const stories = useStoryStore((s) => s.stories);
  const currentWorkspace = useWorkspaceStore((s) => s.currentWorkspace);
  const { data: user } = useQuery(authQueries.user());

  // 워크스페이스 기억 불러오기
  useEffect(() => {
    if (!currentWorkspace?.id) return;
    storiesApi
      .list(currentWorkspace.id)
      .then((data) => storyActions.setStories(data))
      .catch(() => {
        // Supabase 미연결 — 로컬 스토어 유지
      });
  }, [currentWorkspace?.id]);

  const handleFabClick = () => {
    router.push("/stories/edit");
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
