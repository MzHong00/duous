import { supabase } from "@/shared/lib/supabase";
import type { Todo } from "@/features/todo/types/todo";

interface TodoRow {
  id: string;
  workspace_id: string;
  title: string;
  description?: string;
  is_completed: boolean;
  assignee_id?: string;
  start_date: string;
  end_date: string;
  color?: string;
  created_at: string;
}

const rowToTodo = (row: TodoRow): Todo => ({
  id: row.id,
  workspaceId: row.workspace_id,
  title: row.title,
  description: row.description,
  isCompleted: row.is_completed,
  assigneeId: row.assignee_id,
  startDate: row.start_date,
  endDate: row.end_date,
  color: row.color,
  createdAt: row.created_at,
});

export const todosApi = {
  list: async (workspaceId: string): Promise<Todo[]> => {
    const { data, error } = await supabase
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
