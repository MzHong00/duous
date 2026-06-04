"use client";
import { useRouter } from "next/navigation";
import { MapPin } from "lucide-react";

import { ProfileImage } from "@/shared/components/ProfileImage";
import { formatDate } from "@/shared/utils/date";
import type { Story } from "@/features/stories/types/story";
import type { WorkspaceMember } from "@/features/workspace/types/workspace";
import styles from "./MemoryCard.module.scss";

interface Props {
  story: Story;
  isMe: boolean;
  members: WorkspaceMember[];
}

export const MemoryCard = ({ story, isMe, members }: Props) => {
  const router = useRouter();
  const author = members.find((m) => m.id === story.userId);
  const authorName = isMe ? "나" : (author?.name ?? "파트너");
  const authorAvatar = author?.avatar;

  const handleClick = () => {
    router.push(`/stories/edit?storyId=${story.id}`);
  };

  return (
    <button onClick={handleClick} className={styles.card} type="button">
      {story.thumbnailUrl ? (
        <img src={story.thumbnailUrl} alt={story.title || "기억"} className={styles.photo} />
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
