"use client";
import { useRouter } from "next/navigation";

import { ROUTES } from "@/constants/routes";
import { cx } from "@/utils/cn";

import { useFilteredTodos } from "@/features/todo/hooks/useFilteredTodos";
import { TodoItem } from "@/features/todo/components/TodoItem";

import type { Filter } from "@/features/todo/hooks/useFilteredTodos";
import type { Todo } from "@/features/todo/types/todo";
import type { Workspace } from "@/features/workspace/types/workspace";

import styles from "./TodoList.module.scss";

// 캘린더 등 외부 소비자 호환을 위해 Filter 타입을 재노출한다.
export type { Filter };

const FILTERS: Filter[] = ["all", "active", "completed"];

const FILTER_LABELS: Record<Filter, string> = {
  all: "전체",
  active: "진행 중",
  completed: "완료",
};

interface TodoListProps {
  todos: Todo[];
  currentWorkspace: Workspace | null;
  // 캘린더처럼 특정 날짜 기준으로 추가할 때 initialDate를 넘길 수 있음
  initialDate?: string;
  // 현재 활성 필터. 부모(페이지)에서 URL 쿼리스트링과 동기화해 관리한다.
  filter: Filter;
  /** 필터 변경 핸들러 */
  onFilterChange: (filter: Filter) => void;
  /** 완료 여부 토글 핸들러 */
  onToggle: (id: string) => void;
}

export const TodoList = ({
  todos,
  currentWorkspace,
  initialDate,
  filter,
  onFilterChange,
  onToggle,
}: TodoListProps) => {
  const router = useRouter();

  const displayedTodos = useFilteredTodos(todos, filter);

  // initialDate가 있으면 해당 날짜를 기본값으로 세팅한 채로 생성 화면으로 이동한다.
  const addHref = initialDate ? ROUTES.TODO.CREATE.query({ initialDate }) : ROUTES.TODO.CREATE.path;

  return (
    <div className={styles.container}>
      {/* 필터 탭: 전체 / 진행 중 / 완료 */}
      <div className={styles.filters}>
        {FILTERS.map((f) => (
          <button
            key={f}
            className={cx(styles.filterButton, filter === f && styles.filterActive)}
            onClick={() => onFilterChange(f)}
          >
            {FILTER_LABELS[f]}
          </button>
        ))}
      </div>

      <div className={styles.list}>
        {displayedTodos.length === 0 ? (
          <div className={styles.empty}>
            <p className={styles.emptyText}>
              {filter === "completed" ? "완료된 할 일이 없습니다." : "할 일이 없습니다."}
            </p>
            {/* 완료 필터일 때는 추가 버튼을 숨긴다 */}
            {filter !== "completed" && (
              <button onClick={() => router.push(addHref)} className={styles.emptyAction}>
                할 일 추가하기
              </button>
            )}
          </div>
        ) : (
          displayedTodos.map((todo) => (
            <TodoItem
              key={todo.id}
              item={todo}
              currentWorkspace={currentWorkspace}
              onToggle={onToggle}
              onPress={(id) => router.push(ROUTES.TODO.CREATE.query({ todoId: id }))}
            />
          ))
        )}
      </div>
    </div>
  );
};
