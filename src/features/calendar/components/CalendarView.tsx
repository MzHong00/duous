"use client";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { useCalendarStore } from "@/features/calendar/stores/useCalendarStore";
import { useTodoStore } from "@/features/todo/stores/useTodoStore";
import { useWorkspaceStore } from "@/features/workspace/stores/useWorkspaceStore";
import { useQueryParams } from "@/shared/hooks/useQueryParams";
import {
  getTodayDateString,
  formatDate,
  getIntermediateDates,
  getCalendarDays,
  formatYearMonth,
  addMonths,
  getDayOfWeek,
  getDayNumber,
} from "@/shared/utils/date";
import { TodoList } from "@/features/todo/components/TodoList";
import type { Filter } from "@/features/todo/components/TodoList";
import { Card } from "@/shared/components/Card";
import { AppHeader } from "@/shared/components/AppHeader";
import { COLORS } from "@/shared/constants/theme";
import styles from "./CalendarView.module.scss";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

export const CalendarView = () => {
  const router = useRouter();
  const [params, setParams] = useQueryParams();
  const today = getTodayDateString();

  const dateParam = params.get("date") || today;
  const [selectedDate, setSelectedDate] = useState(dateParam);
  const [currentMonth, setCurrentMonth] = useState(dateParam.substring(0, 7));
  const [filter, setFilter] = useState<Filter>("all");

  const events = useCalendarStore((s) => s.events);
  const todos = useTodoStore((s) => s.todos);
  const currentWorkspace = useWorkspaceStore((s) => s.currentWorkspace);

  const markedDates = useMemo(() => {
    const marks: Record<string, string[]> = {};
    const addMark = (items: Array<{ startDate: string; endDate: string; color: string }>) => {
      items.forEach((item) => {
        const range = [
          item.startDate,
          ...getIntermediateDates(item.startDate, item.endDate),
          item.endDate,
        ];
        [...new Set(range)].forEach((date) => {
          if (!marks[date]) marks[date] = [];
          if (!marks[date].includes(item.color)) marks[date].push(item.color);
        });
      });
    };
    addMark(events.map((e) => ({ ...e })));
    addMark(
      todos.map((t) => ({
        startDate: t.startDate,
        endDate: t.endDate,
        color: t.color || COLORS.primary,
      }))
    );
    return marks;
  }, [events, todos]);

  const calendarDays = useMemo(() => getCalendarDays(currentMonth), [currentMonth]);

  const selectedDateTodos = useMemo(() => {
    return todos.filter(
      (t) =>
        t.workspaceId === currentWorkspace?.id &&
        selectedDate >= t.startDate &&
        selectedDate <= t.endDate
    );
  }, [todos, currentWorkspace?.id, selectedDate]);

  const handleSelectDate = (date: string) => {
    setSelectedDate(date);
    setFilter("all");
    setParams.set("date", date);
  };

  return (
    <div className={styles.page}>
      <AppHeader />

      <div className={styles.calendarHeader}>
        <h2 className={styles.monthTitle}>{formatYearMonth(currentMonth)}</h2>
        <div className={styles.controls}>
          <button
            onClick={() => setCurrentMonth((m) => addMonths(m, -1))}
            className={styles.controlButton}
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => setCurrentMonth((m) => addMonths(m, 1))}
            className={styles.controlButton}
          >
            <ChevronRight size={18} />
          </button>
          <button
            onClick={() => router.push(`/todo/create?initialDate=${selectedDate}`)}
            className={styles.controlButton}
          >
            <Plus size={20} />
          </button>
        </div>
      </div>

      <Card className={styles.calendarCard}>
        <div className={styles.weekdays}>
          {WEEKDAYS.map((day, i) => (
            <div
              key={day}
              className={[
                styles.weekday,
                i === 0 ? styles.weekdaySun : i === 6 ? styles.weekdaySat : styles.weekdayDefault,
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {day}
            </div>
          ))}
        </div>

        <div className={styles.days}>
          {calendarDays.map((date, idx) => {
            if (!date) return <div key={`empty-${idx}`} />;
            const dayOfWeek = getDayOfWeek(date);
            const isSelected = date === selectedDate;
            const isToday = date === today;
            const dots = markedDates[date] || [];

            return (
              <button
                key={date}
                onClick={() => handleSelectDate(date)}
                className={styles.dayButton}
              >
                <span
                  className={[
                    styles.dayNumber,
                    isSelected
                      ? styles.dayNumberSelected
                      : isToday
                        ? styles.dayNumberToday
                        : dayOfWeek === 0
                          ? styles.dayNumberSun
                          : dayOfWeek === 6
                            ? styles.dayNumberSat
                            : undefined,
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {getDayNumber(date)}
                </span>
                {dots.length > 0 && (
                  <div className={styles.dots}>
                    {dots.slice(0, 3).map((color, i) => (
                      <div
                        key={i}
                        className={styles.dot}
                        style={{ backgroundColor: isSelected ? "white" : color }}
                      />
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </Card>

      <div className={styles.todoSection}>
        <h2 className={styles.todoTitle}>{formatDate(selectedDate, "M월 D일")} 할 일</h2>
        <TodoList
          todos={selectedDateTodos}
          currentWorkspace={currentWorkspace}
          initialDate={selectedDate}
          filter={filter}
          onFilterChange={setFilter}
        />
      </div>
    </div>
  );
};
