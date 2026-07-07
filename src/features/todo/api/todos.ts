import { supabase } from "@/lib/supabase/client";
import { rowToTodo } from "@/features/todo/utils/todoUtils";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Todo } from "@/features/todo/types/todo";
import type { TodoRow } from "@/features/todo/utils/todoUtils";

export const todosApi = {
  // client 미지정 시 브라우저 클라이언트 사용 — 서버 prefetch에서는 서버 클라이언트 주입
  list: async (workspaceId: string, client: SupabaseClient = supabase): Promise<Todo[]> => {
    const { data, error } = await client
      .from("todos")
      .select("*")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false });
    if (error) throw error;
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
    if (error) throw error;
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
    if (error) throw error;
    return rowToTodo(data as TodoRow);
  },

  toggle: async (id: string, isCompleted: boolean): Promise<Todo> => {
    const { data, error } = await supabase
      .from("todos")
      .update({ is_completed: isCompleted })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return rowToTodo(data as TodoRow);
  },

  delete: async (id: string): Promise<void> => {
    const { error } = await supabase.from("todos").delete().eq("id", id);
    if (error) throw error;
  },
};
