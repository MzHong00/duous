import type { Todo } from "@/features/todo/types/todo";

export interface TodoRow {
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

/** Supabase row를 앱의 Todo 타입으로 변환한다 */
export const rowToTodo = (row: TodoRow): Todo => ({
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
