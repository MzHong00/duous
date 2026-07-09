"use client";
import { CalendarDays, ChevronRight, Circle, ListTodo } from "lucide-react";
import { useRouter } from "next/navigation";

import { ROUTES } from "@/constants/routes";
import { useHomeDigest } from "@/features/home/hooks/useHomeDigest";
import { formatDate, getRelativeDateLabel, isToday } from "@/utils/date";

import styles from "./UpcomingDigest.module.scss";

const SECTION_ICON_SIZE = 14; // 섹션 헤더 아이콘 크기(px)
const ARROW_ICON_SIZE = 14; // 섹션 이동 화살표 아이콘 크기(px)
const TODO_DOT_SIZE = 8; // 할 일 행 앞 미완료 표시 점 크기(px)

/** 홈 중앙의 다가오는 일정·오늘 할 일 요약을 보여주는 유리 질감 다이제스트 카드 */
export const UpcomingDigest = () => {
  const router = useRouter();
  const { upcomingEvents, todayTodos, todayTodoTotal } = useHomeDigest();

  const hiddenTodoCount = todayTodoTotal - todayTodos.length; // 노출 개수 초과분 (더보기 카운트)

  return (
    <div className={styles.digest}>
      <section className={styles.section}>
        <button
          type="button"
          onClick={() => router.push(ROUTES.CALENDAR.path)}
          className={styles.sectionHeader}
          aria-label="다가오는 일정, 캘린더로 이동"
        >
          <span className={styles.sectionTitle}>
            <CalendarDays size={SECTION_ICON_SIZE} className={styles.calendarIcon} />
            다가오는 일정
          </span>
          <ChevronRight size={ARROW_ICON_SIZE} className={styles.arrow} />
        </button>

        {upcomingEvents.length > 0 ? (
          <ul className={styles.list}>
            {upcomingEvents.map((event) => (
              <li key={event.id} className={styles.row}>
                <span className={styles.eventDate}>
                  {isToday(event.startDate) ? "오늘" : formatDate(event.startDate, "M/D")}
                </span>
                <span className={styles.rowTitle}>{event.title}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.empty}>예정된 일정이 없어요</p>
        )}
      </section>

      <div className={styles.divider} />

      <section className={styles.section}>
        <button
          type="button"
          onClick={() => router.push(ROUTES.TODO.path)}
          className={styles.sectionHeader}
          aria-label="오늘 할 일, 할 일 목록으로 이동"
        >
          <span className={styles.sectionTitle}>
            <ListTodo size={SECTION_ICON_SIZE} className={styles.todoIcon} />
            오늘 할 일
          </span>
          <ChevronRight size={ARROW_ICON_SIZE} className={styles.arrow} />
        </button>

        {todayTodos.length > 0 ? (
          <ul className={styles.list}>
            {todayTodos.map((todo) => (
              <li key={todo.id} className={styles.row}>
                <Circle size={TODO_DOT_SIZE} className={styles.todoDot} />
                <span className={styles.rowTitle}>{todo.title}</span>
                <span className={styles.todoDue}>{getRelativeDateLabel(todo.endDate)}</span>
              </li>
            ))}
            {hiddenTodoCount > 0 && (
              <li className={styles.more}>외 {hiddenTodoCount}개 더 있어요</li>
            )}
          </ul>
        ) : (
          <p className={styles.empty}>오늘은 할 일이 없어요, 여유로운 하루 보내세요</p>
        )}
      </section>
    </div>
  );
};
