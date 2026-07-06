import { cx } from "@/utils/cn";
import { getDayNumber, getDayOfWeek } from "@/utils/date";

import styles from "./CalendarDayCell.module.scss";

const SUNDAY = 0; // 일요일 요일 인덱스
const SATURDAY = 6; // 토요일 요일 인덱스
const MAX_DOTS = 3; // 셀에 표시할 최대 점 개수

interface CalendarDayCellProps {
  date: string; // 셀 날짜 (YYYY-MM-DD)
  isSelected: boolean; // 선택된 날짜 여부
  isToday: boolean; // 오늘 날짜 여부
  dotColors: string[]; // 해당 날짜의 일정 색상 목록
  /** 날짜 클릭 핸들러 */
  onSelect: (date: string) => void;
}

export const CalendarDayCell = ({
  date,
  isSelected,
  isToday,
  dotColors,
  onSelect,
}: CalendarDayCellProps) => {
  const dayOfWeek = getDayOfWeek(date); // 요일 인덱스 (0=일 ~ 6=토)

  const numberClass = cx(
    styles.dayNumber,
    isSelected && styles.dayNumberSelected,
    !isSelected && isToday && styles.dayNumberToday,
    !isSelected && !isToday && dayOfWeek === SUNDAY && styles.dayNumberSun,
    !isSelected && !isToday && dayOfWeek === SATURDAY && styles.dayNumberSat
  );

  return (
    <button onClick={() => onSelect(date)} className={styles.dayButton}>
      <span className={numberClass}>{getDayNumber(date)}</span>
      {dotColors.length > 0 && (
        <div className={styles.dots}>
          {dotColors.slice(0, MAX_DOTS).map((color, i) => (
            <div
              key={i}
              className={cx(styles.dot, isSelected && styles.dotSelected)}
              style={isSelected ? undefined : { backgroundColor: color }}
            />
          ))}
        </div>
      )}
    </button>
  );
};
