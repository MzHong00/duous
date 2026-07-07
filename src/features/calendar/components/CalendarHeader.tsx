import { memo } from "react";

import { ChevronLeft, ChevronRight, Plus } from "lucide-react";

import { formatYearMonth } from "@/utils/date";

import styles from "./CalendarHeader.module.scss";

const PREV_MONTH = -1; // 이전 달 이동 delta
const NEXT_MONTH = 1; // 다음 달 이동 delta
const NAV_ICON_SIZE = 18; // 월 이동 아이콘 크기
const ADD_ICON_SIZE = 20; // 추가 아이콘 크기

interface CalendarHeaderProps {
  currentMonth: string; // 표시 중인 월 (YYYY-MM)
  /** 월 이동 핸들러 (delta 만큼 이동) */
  onMoveMonth: (delta: number) => void;
  /** 일정 추가 핸들러 */
  onAddEvent: () => void;
}

// TodoList 필터 변경 등 부모(CalendarView) 리렌더 시 props 참조가 그대로면 재렌더를 건너뛴다
const CalendarHeaderComponent = ({
  currentMonth,
  onMoveMonth,
  onAddEvent,
}: CalendarHeaderProps) => {
  return (
    <div className={styles.calendarHeader}>
      <h2 className={styles.monthTitle}>{formatYearMonth(currentMonth)}</h2>
      <div className={styles.controls}>
        <button
          onClick={() => onMoveMonth(PREV_MONTH)}
          className={styles.controlButton}
          aria-label="이전 달"
        >
          <ChevronLeft size={NAV_ICON_SIZE} />
        </button>
        <button
          onClick={() => onMoveMonth(NEXT_MONTH)}
          className={styles.controlButton}
          aria-label="다음 달"
        >
          <ChevronRight size={NAV_ICON_SIZE} />
        </button>
        <button onClick={onAddEvent} className={styles.controlButton} aria-label="일정 추가">
          <Plus size={ADD_ICON_SIZE} />
        </button>
      </div>
    </div>
  );
};

export const CalendarHeader = memo(CalendarHeaderComponent);
CalendarHeader.displayName = "CalendarHeader";
