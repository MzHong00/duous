"use client";
import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Search, Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { ROUTES } from "@/constants/routes";
import { useQueryParams } from "@/hooks/useQueryParams";
import { cx } from "@/utils/cn";
import { storyQueries } from "@/features/stories/queries/storyQueries";
import { useCurrentWorkspace } from "@/features/workspace/hooks/useCurrentWorkspace";
import { StoryItem } from "@/features/stories/components/StoryItem";

import styles from "./StoriesView.module.scss";

export const StoriesView = () => {
  const router = useRouter();
  const [params, setParams] = useQueryParams();
  const { currentWorkspace } = useCurrentWorkspace();
  const { data: stories = [] } = useQuery(storyQueries.list(currentWorkspace?.id ?? ""));

  const searchQuery = params.get("q") || "";

  const filteredStories = useMemo(() => {
    return stories.filter((story) =>
      (story.title ?? "").toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [stories, searchQuery]);

  const leftCol = filteredStories.filter((_, i) => i % 2 === 0);
  const rightCol = filteredStories.filter((_, i) => i % 2 !== 0);

  const handleSearchChange = (value: string) => {
    if (value) {
      setParams.set("q", value);
    } else {
      setParams.delete("q");
    }
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <button
          onClick={() => router.push(ROUTES.STORIES.path)}
          className={styles.backButton}
          aria-label="보드로 돌아가기"
        >
          <ChevronLeft size={24} />
        </button>
        <p className={styles.headerTitle}>스토리 목록</p>
        <div className={styles.headerRight} />
      </header>

      <div className={styles.searchRow}>
        <Search size={18} className={styles.searchIcon} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="추억을 검색해보세요"
          className={styles.searchInput}
        />
        <button onClick={() => router.push(ROUTES.STORIES.EDIT.path)} className={styles.addButton}>
          <Plus size={22} strokeWidth={2.5} />
        </button>
      </div>

      <div className={styles.grid}>
        {filteredStories.length === 0 ? (
          <div className={styles.empty}>
            <p>{searchQuery ? "검색 결과가 없어요." : "아직 스토리가 없어요."}</p>
            {!searchQuery && (
              <button
                onClick={() => router.push(ROUTES.STORIES.EDIT.path)}
                className={styles.emptyLink}
              >
                첫 스토리 기록하기
              </button>
            )}
          </div>
        ) : (
          <div className={styles.columns}>
            <div className={styles.col}>
              {leftCol.map((story) => (
                <StoryItem
                  key={story.id}
                  story={story}
                  onPress={(id) => router.push(ROUTES.STORIES.detail(id))}
                />
              ))}
            </div>
            <div className={cx(styles.col, styles.colOffset)}>
              {rightCol.map((story) => (
                <StoryItem
                  key={story.id}
                  story={story}
                  onPress={(id) => router.push(ROUTES.STORIES.detail(id))}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
