import { ProfileImage } from "@/components/ProfileImage";
import { cx } from "@/utils/cn";
import { AVATAR_FALLBACK_NAME, BUBBLE_AVATAR_SIZE } from "@/features/chat/constants/chat";

import type { ChatMessage } from "@/features/chat/types/chat";

import styles from "./MessageBubble.module.scss";

interface MessageBubbleProps {
  text: string;
  sender: ChatMessage["sender"];
  time: string;
  avatar?: string;
  name?: string;
}

export const MessageBubble = ({ text, sender, time, avatar, name }: MessageBubbleProps) => {
  const isMe = sender === "me";

  if (isMe) {
    return (
      <div className={styles.rowMe}>
        <div className={styles.innerMe}>
          <span className={styles.time}>{time}</span>
          <div className={styles.bubbleMe}>
            <p className={styles.text}>{text}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.rowPartner}>
      <ProfileImage
        uri={avatar}
        name={name || AVATAR_FALLBACK_NAME}
        size={BUBBLE_AVATAR_SIZE}
        className={styles.partnerAvatar}
      />
      <div className={styles.innerPartner}>
        <div className={styles.bubblePartner}>
          <p className={cx(styles.text, styles.textPartner)}>{text}</p>
        </div>
        <span className={styles.time}>{time}</span>
      </div>
    </div>
  );
};
