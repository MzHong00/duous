"use client";
import { MapPin, X } from "lucide-react";

import { cx } from "@/utils/cn";
import { formatDate } from "@/utils/date";

import type { Story } from "@/features/stories/types/story";

import styles from "./MemoryCard.module.scss";

interface MemoryCardProps {
  story: Story;
  isExpanded?: boolean;
  onClose?: (e: React.MouseEvent) => void;
  showDate?: boolean;
  isShell?: boolean; // 예시(껍데기) 카드 여부 — 점선 표시로 구분
}

export const MemoryCard = ({ story, isExpanded, onClose, showDate, isShell }: MemoryCardProps) => {
  const cardTitle = story.title || story.description || "제목 없음";

  if (isExpanded) {
    return (
      <div className={cx(styles.card, styles.expanded)} aria-label={`기억 상세, ${cardTitle}`}>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className={styles.closeButton}
            aria-label="상세 닫기"
          >
            <X size={20} />
          </button>
        )}

        <div className={styles.expandedContent}>
          {story.thumbnailUrl ? (
            <div className={styles.expandedImageWrap}>
              <img src={story.thumbnailUrl} alt="" className={styles.expandedPhoto} />
            </div>
          ) : (
            <div className={styles.expandedPlaceholder}>
              <MapPin size={48} className={styles.expandedPlaceholderIcon} />
            </div>
          )}

          <div className={styles.expandedDetails}>
            <div className={styles.metaRow}>
              <span className={styles.expandedDate}>{story.date}</span>
            </div>
            <h2 className={styles.expandedTitle}>{cardTitle}</h2>
            <p className={styles.expandedDesc}>
              {story.description || "오늘 함께한 특별한 순간의 기록이 담겨 있습니다."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cx(styles.card, isShell && styles.shell)}
      aria-label={`기억, ${cardTitle}`}
    >
      {story.thumbnailUrl ? (
        <img src={story.thumbnailUrl} alt="" aria-hidden="true" className={styles.photo} />
      ) : (
        <div className={styles.photoPlaceholder}>
          <MapPin size={24} className={styles.photoPlaceholderIcon} />
        </div>
      )}

      <div className={styles.overlay}>
        {showDate && story.date && (
          <span className={styles.dateBadge}>{formatDate(story.date, "YYYY.MM.DD")}</span>
        )}
        <p className={styles.caption}>{cardTitle}</p>
      </div>
    </div>
  );
};
