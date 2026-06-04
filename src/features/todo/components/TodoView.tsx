"use client";
import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { useTodoStore } from "@/features/todo/stores/useTodoStore";
import { useWorkspaceStore } from "@/features/workspace/stores/useWorkspaceStore";
import { useQueryParams } from "@/shared/hooks/useQueryParams";
import { AppHeader } from "@/shared/components/AppHeader";
import { TodoList } from "@/features/todo/components/TodoList";
import type { Filter } from "@/features/todo/components/TodoList";
import styles from "./TodoView.module.scss";

const VALID_FILTERS: Filter[] = ["all", "active", "completed"];

export const TodoView = () => {
  const router = useRouter();
  const [params, setParams] = useQueryParams();
  const todos = useTodoStore((s) => s.todos);
  const currentWorkspace = useWorkspaceStore((s) => s.currentWorkspace);

  const rawFilter = params.get("filter");
  const filter: Filter = VALID_FILTERS.includes(rawFilter as Filter)
    ? (rawFilter as Filter)
    : "all";

  const workspaceTodos = useMemo(
    () => todos.filter((t) => t.workspaceId === currentWorkspace?.id),
    [todos, currentWorkspace?.id]
  );

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
          <button onClick={() => router.push("/todo/create")} className={styles.addButton}>
            <Plus size={22} />
          </button>
        }
      />
      <TodoList
        todos={workspaceTodos}
        currentWorkspace={currentWorkspace}
        filter={filter}
        onFilterChange={handleFilterChange}
      />
    </div>
  );
};
