import { memo } from "react";

import { ProfileImage } from "@/components/ui/ProfileImage";
import { cx } from "@/utils/cn";
import { formatChatTime } from "@/utils/date";
import { AVATAR_FALLBACK_NAME } from "@/features/chat/constants/chat";
import { AVATAR_SIZE } from "@/constants/style";

import styles from "./MessageBubble.module.scss";

import type { ChatMessage } from "@/features/chat/types/chat";

interface MessageBubbleProps {
  text: string;
  sender: ChatMessage["sender"];
  createdAt: string; // 생성 시각 ISO 문자열(뷰어 타임존 기준으로 이 컴포넌트에서 포맷)
  avatar?: string;
  name?: string;
  isFirstInGroup: boolean; // 같은 발신자·같은 분 묶음의 첫 메시지인지(상대 아바타·이름 표시 기준)
  isLastInGroup: boolean; // 같은 발신자·같은 분 묶음의 마지막 메시지인지(시간 표시 기준)
}

// 새 메시지 도착 시 목록 배열 참조가 바뀌어도 기존 버블은 props 동일 시 리렌더를 건너뛴다
const MessageBubbleComponent = ({
  text,
  sender,
  createdAt,
  avatar,
  name,
  isFirstInGroup,
  isLastInGroup,
}: MessageBubbleProps) => {
  const isMe = sender === "me";

  if (isMe) {
    return (
      <div className={cx(styles.rowMe, !isFirstInGroup && styles.rowGrouped)}>
        <div className={styles.innerMe}>
          {isLastInGroup && <span className={styles.time}>{formatChatTime(createdAt)}</span>}
          <div className={styles.bubbleMe}>
            <p className={styles.text}>{text}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cx(styles.rowPartner, !isFirstInGroup && styles.rowGrouped)}>
      <div className={styles.avatarSlot}>
        {isFirstInGroup && (
          <ProfileImage
            uri={avatar}
            name={name || AVATAR_FALLBACK_NAME}
            size={AVATAR_SIZE.sm}
            className={styles.partnerAvatar}
          />
        )}
      </div>
      <div className={styles.innerPartner}>
        <div className={styles.bubblePartner}>
          <p className={cx(styles.text, styles.textPartner)}>{text}</p>
        </div>
        {isLastInGroup && <span className={styles.time}>{formatChatTime(createdAt)}</span>}
      </div>
    </div>
  );
};

export const MessageBubble = memo(MessageBubbleComponent);
MessageBubble.displayName = "MessageBubble";
