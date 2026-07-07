"use client";
import { MapPin } from "lucide-react";
import { useRouter } from "next/navigation";

import { ProfileImage } from "@/components/ProfileImage";
import { ROUTES } from "@/constants/routes";
import { formatDate } from "@/utils/date";

import type { Story } from "@/features/stories/types/story";
import type { WorkspaceMember } from "@/features/workspace/types/workspace";

import styles from "./MemoryCard.module.scss";

const SELF_LABEL = "나"; // 본인 작성 기억의 작성자 표시명
const FALLBACK_AUTHOR_LABEL = "파트너"; // 작성자 정보를 찾지 못했을 때 표시명

interface MemoryCardProps {
  story: Story;
  isMe: boolean;
  members: WorkspaceMember[];
}

export const MemoryCard = ({ story, isMe, members }: MemoryCardProps) => {
  const router = useRouter();
  const author = members.find((m) => m.id === story.userId);
  const authorName = isMe ? SELF_LABEL : (author?.name ?? FALLBACK_AUTHOR_LABEL);
  const authorAvatar = author?.avatar;

  const handleClick = () => {
    router.push(ROUTES.STORIES.EDIT.query({ storyId: story.id }));
  };

  return (
    <button
      onClick={handleClick}
      className={styles.card}
      type="button"
      aria-label={`${authorName}의 기억, ${story.title || story.description || "제목 없음"} 상세 보기`}
    >
      {story.thumbnailUrl ? (
        <img src={story.thumbnailUrl} alt="" aria-hidden="true" className={styles.photo} />
      ) : (
        <div className={styles.photoPlaceholder}>
          <MapPin size={24} className={styles.photoPlaceholderIcon} />
        </div>
      )}

      <div className={styles.body}>
        <div className={styles.meta}>
          <div className={styles.author}>
            <ProfileImage uri={authorAvatar} name={authorName} size={22} />
            <span className={styles.authorName}>{authorName}</span>
          </div>
          <span className={styles.date}>{formatDate(story.date, "M월 D일")}</span>
        </div>
        {(story.title || story.description) && (
          <p className={styles.caption}>{story.title || story.description}</p>
        )}
        {story.path.length > 1 && (
          <div className={styles.pathBadge}>
            <MapPin size={10} />
            <span>경로 기록됨</span>
          </div>
        )}
      </div>
    </button>
  );
};
