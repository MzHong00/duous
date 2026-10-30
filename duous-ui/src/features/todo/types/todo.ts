export interface Todo {
  id: string;
  workspaceId: string;
  title: string;
  description?: string;
  isCompleted: boolean;
  assigneeId?: string;
  startDate: string;
  endDate: string;
  color?: string;
  createdAt: string;
}
