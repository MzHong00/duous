import { MapPin } from "lucide-react";

import { formatDate } from "@/utils/date";
import { cx } from "@/utils/cn";

import type { Story } from "@/features/stories/types/story";

import styles from "./StoryItem.module.scss";

interface StoryItemProps {
  story: Story;
  onPress: (id: string) => void;
}

export const StoryItem = ({ story, onPress }: StoryItemProps) => {
  const hasThumbnail = !!story.thumbnailUrl; // 썸네일 이미지 존재 여부

  return (
    <button onClick={() => onPress(story.id)} className={styles.item}>
      <div
        className={cx(
          styles.thumbnail,
          hasThumbnail ? styles.thumbnailTall : styles.thumbnailShort
        )}
        style={{ backgroundColor: `${story.pathColor}20` }}
      >
        {hasThumbnail ? (
          <img src={story.thumbnailUrl} alt={story.title} className={styles.thumbnailImage} />
        ) : (
          <MapPin size={32} style={{ color: story.pathColor }} />
        )}
      </div>
      <div className={styles.info}>
        <p className={styles.title}>{story.title}</p>
        <p className={styles.date}>{formatDate(story.date, "YYYY.MM.DD")}</p>
      </div>
    </button>
  );
};
