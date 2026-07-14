import { useCallback, useState } from "react";

import { useToggleTodoMutation } from "@/features/todo/queries/todoMutations";

import type { Todo } from "@/features/todo/types/todo";

/**
 * 할 일 완료 여부를 서버에 토글 반영한다.
 * 토글 진행 중 여부를 항목별로 추적해, 한 항목이 처리 중이어도 다른 항목은 즉시 토글할 수 있게 한다.
 * (동일 항목에 대한 중복 클릭만 무시해 stale 캐시 기반 중복 전송을 막는다)
 */
export const useTodoToggle = (workspaceId: string, todos: Todo[]) => {
  const { mutate: toggleMutate } = useToggleTodoMutation(workspaceId);
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());

  const toggleTodo = useCallback(
    (id: string) => {
      if (pendingIds.has(id)) return;
      const target = todos.find((t) => t.id === id);
      if (!target) return;

      setPendingIds((prev) => new Set(prev).add(id));
      toggleMutate(
        { id, isCompleted: !target.isCompleted },
        {
          onSettled: () =>
            setPendingIds((prev) => {
              const next = new Set(prev);
              next.delete(id);
              return next;
            }),
        }
      );
    },
    [todos, pendingIds, toggleMutate]
  );

  return { toggleTodo, pendingToggleIds: pendingIds };
};
