import { StoryBriefInfo } from "@/features/stories/components/StoryBriefInfo";
import type { Story } from "@/features/stories/types/story";
import styles from "./MapStoryInfo.module.scss";

interface MapStoryInfoProps {
  story: Story;
}

export const MapStoryInfo = ({ story }: MapStoryInfoProps) => {
  return (
    <div className={styles.container}>
      <StoryBriefInfo story={story} />

      {story.thumbnailUrl && (
        <img src={story.thumbnailUrl} alt={story.title} className={styles.thumbnail} />
      )}

      {story.description && <p className={styles.description}>{story.description}</p>}
    </div>
  );
};
