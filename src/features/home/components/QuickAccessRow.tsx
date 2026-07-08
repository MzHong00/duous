"use client";
import { useRouter } from "next/navigation";
import { MessageCircle, CalendarDays, ListTodo } from "lucide-react";

import { ROUTES } from "@/constants/routes";
import { useQuickAccessSummary } from "@/features/home/hooks/useQuickAccessSummary";

import styles from "./QuickAccessRow.module.scss";

const ICON_SIZE = 18; // 퀵 액션 카드 상단 아이콘 크기(px)
const GHOST_ICON_SIZE = 56; // 카드 배경에 녹아드는 워터마크 아이콘 크기(px)

/** 홈 화면 상단에서 채팅·캘린더·할 일로 바로 이동하는 퀵 액션 행 (캘린더·할 일은 실데이터 카운트 노출) */
export const QuickAccessRow = () => {
  const router = useRouter();
  const { monthlyEventCount, todayTodoCount } = useQuickAccessSummary();

  return (
    <div className={styles.row}>
      <button
        type="button"
        onClick={() => router.push(ROUTES.CHAT.path)}
        className={styles.item}
        data-color="primary"
      >
        <MessageCircle size={GHOST_ICON_SIZE} className={styles.ghostIcon} />
        <MessageCircle size={ICON_SIZE} className={styles.icon} />
        <span className={styles.label}>채팅</span>
        <span className={styles.summary}>메시지 보내기</span>
      </button>

      <button
        type="button"
        onClick={() => router.push(ROUTES.CALENDAR.path)}
        className={styles.item}
        data-color="green"
      >
        <CalendarDays size={GHOST_ICON_SIZE} className={styles.ghostIcon} />
        <CalendarDays size={ICON_SIZE} className={styles.icon} />
        <span className={styles.label}>캘린더</span>
        {monthlyEventCount > 0 ? (
          <span className={styles.summary}>이번 달 일정 {monthlyEventCount}개</span>
        ) : (
          <span className={styles.summaryEmpty}>이번 달 일정 없음</span>
        )}
      </button>

      <button
        type="button"
        onClick={() => router.push(ROUTES.TODO.path)}
        className={styles.item}
        data-color="warning"
      >
        <ListTodo size={GHOST_ICON_SIZE} className={styles.ghostIcon} />
        <ListTodo size={ICON_SIZE} className={styles.icon} />
        <span className={styles.label}>할 일</span>
        {todayTodoCount > 0 ? (
          <span className={styles.summary}>오늘 할 일 {todayTodoCount}개</span>
        ) : (
          <span className={styles.summaryEmpty}>오늘 할 일 없음</span>
        )}
      </button>
    </div>
  );
};
