"use client";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants/routes";
import { Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { todoQueries } from "@/features/todo/queries/todoQueries";
import { useToggleTodoMutation } from "@/features/todo/queries/todoMutations";
import { useCurrentWorkspace } from "@/features/workspace/hooks/useCurrentWorkspace";
import { useQueryParams } from "@/hooks/useQueryParams";
import { AppHeader } from "@/components/AppHeader";
import { TodoList } from "@/features/todo/components/TodoList";
import type { Filter } from "@/features/todo/hooks/useFilteredTodos";
import styles from "./TodoView.module.scss";

const VALID_FILTERS: Filter[] = ["all", "active", "completed"];

export const TodoView = () => {
  const router = useRouter();
  const [params, setParams] = useQueryParams();
  const { currentWorkspace } = useCurrentWorkspace();
  const { data: todos = [] } = useQuery(todoQueries.list(currentWorkspace?.id ?? ""));
  const toggleTodo = useToggleTodoMutation(currentWorkspace?.id ?? "");

  const rawFilter = params.get("filter");
  const filter: Filter = VALID_FILTERS.includes(rawFilter as Filter)
    ? (rawFilter as Filter)
    : "all";

  /** 완료 여부를 서버에 토글 반영한다 */
  const handleToggle = (id: string) => {
    const target = todos.find((t) => t.id === id);
    if (target) toggleTodo.mutate({ id, isCompleted: !target.isCompleted });
  };

  const handleFilterChange = (f: Filter) => {
    if (f === "all") {
      setParams.delete("filter");
    } else {
      setParams.set("filter", f);
    }
  };

  return (
    <div className={styles.page}>
      <AppHeader
        rightElement={
          <button onClick={() => router.push(ROUTES.TODO.CREATE.path)} className={styles.addButton}>
            <Plus size={22} />
          </button>
        }
      />
      <TodoList
        todos={todos}
        currentWorkspace={currentWorkspace}
        filter={filter}
        onFilterChange={handleFilterChange}
        onToggle={handleToggle}
      />
    </div>
  );
};
