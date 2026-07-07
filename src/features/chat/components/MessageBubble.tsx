import { memo } from "react";

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

// 새 메시지 도착 시 목록 배열 참조가 바뀌어도 기존 버블은 props 동일 시 리렌더를 건너뛴다
const MessageBubbleComponent = ({ text, sender, time, avatar, name }: MessageBubbleProps) => {
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

export const MessageBubble = memo(MessageBubbleComponent);
MessageBubble.displayName = "MessageBubble";
