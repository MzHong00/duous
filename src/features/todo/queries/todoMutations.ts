import { useMutation, useQueryClient } from "@tanstack/react-query";

import { todosApi } from "@/features/todo/api/todos";
import type { Todo } from "@/features/todo/types/todo";
import { todoQueries } from "./todoQueries";

export const useCreateTodoMutation = (workspaceId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (todo: Omit<Todo, "id" | "createdAt">) => todosApi.create(todo),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: todoQueries.list(workspaceId).queryKey }),
  });
};

export const useUpdateTodoMutation = (workspaceId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<Omit<Todo, "id" | "workspaceId" | "createdAt">>;
    }) => todosApi.update(id, updates),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: todoQueries.list(workspaceId).queryKey }),
  });
};

export const useToggleTodoMutation = (workspaceId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isCompleted }: { id: string; isCompleted: boolean }) =>
      todosApi.toggle(id, isCompleted),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: todoQueries.list(workspaceId).queryKey }),
  });
};

export const useDeleteTodoMutation = (workspaceId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => todosApi.delete(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: todoQueries.list(workspaceId).queryKey }),
  });
};
