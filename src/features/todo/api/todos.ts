import { supabase } from "@/lib/supabase/client";
import { rowToTodo } from "@/features/todo/utils/todoUtils";
import { ApiError } from "@/lib/errors/apiError";

import type { Todo } from "@/features/todo/types/todo";
import type { TodoRow } from "@/features/todo/utils/todoUtils";

export const todosApi = {
  list: async (workspaceId: string): Promise<Todo[]> => {
    const { data, error } = await supabase
      .from("todos")
      .select("*")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false });
    if (error) throw new ApiError("할 일 목록 조회에 실패했습니다.", error);
    return (data as TodoRow[]).map(rowToTodo);
  },

  create: async (todo: Omit<Todo, "id" | "createdAt">): Promise<Todo> => {
    const { data, error } = await supabase
      .from("todos")
      .insert({
        workspace_id: todo.workspaceId,
        title: todo.title,
        description: todo.description,
        is_completed: todo.isCompleted,
        assignee_id: todo.assigneeId,
        start_date: todo.startDate,
        end_date: todo.endDate,
        color: todo.color,
      })
      .select()
      .single();
    if (error) throw new ApiError("할 일 생성에 실패했습니다.", error);
    return rowToTodo(data as TodoRow);
  },

  update: async (
    id: string,
    updates: Partial<Omit<Todo, "id" | "workspaceId" | "createdAt">>
  ): Promise<Todo> => {
    const { data, error } = await supabase
      .from("todos")
      .update({
        title: updates.title,
        description: updates.description,
        is_completed: updates.isCompleted,
        assignee_id: updates.assigneeId,
        start_date: updates.startDate,
        end_date: updates.endDate,
        color: updates.color,
      })
      .eq("id", id)
      .select()
      .single();
    if (error) throw new ApiError("할 일 수정에 실패했습니다.", error);
    return rowToTodo(data as TodoRow);
  },

  toggle: async (id: string, isCompleted: boolean): Promise<Todo> => {
    const { data, error } = await supabase
      .from("todos")
      .update({ is_completed: isCompleted })
      .eq("id", id)
      .select()
      .single();
    if (error) throw new ApiError("할 일 상태 변경에 실패했습니다.", error);
    return rowToTodo(data as TodoRow);
  },

  delete: async (id: string): Promise<void> => {
    const { error } = await supabase.from("todos").delete().eq("id", id);
    if (error) throw new ApiError("할 일 삭제에 실패했습니다.", error);
  },
};
