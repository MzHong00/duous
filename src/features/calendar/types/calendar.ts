export interface CalendarEvent {
  id: string;
  workspaceId: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  startTime?: string;
  endTime?: string;
  isAllDay: boolean;
  color: string;
  createdAt: string;
}

export type CreateEventData = Omit<CalendarEvent, "id" | "createdAt">;
