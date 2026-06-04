import { useMutation, useQueryClient } from "@tanstack/react-query";

import { calendarApi } from "@/features/calendar/api/calendar";
import type { CalendarEvent, CreateEventData } from "@/features/calendar/types/calendar";
import { calendarQueries } from "./calendarQueries";

export const useCreateEventMutation = (workspaceId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (eventData: CreateEventData) => calendarApi.create(eventData),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: calendarQueries.list(workspaceId).queryKey }),
  });
};

export const useUpdateEventMutation = (workspaceId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<Omit<CalendarEvent, "id" | "workspaceId" | "createdAt">>;
    }) => calendarApi.update(id, updates),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: calendarQueries.list(workspaceId).queryKey }),
  });
};

export const useDeleteEventMutation = (workspaceId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => calendarApi.delete(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: calendarQueries.list(workspaceId).queryKey }),
  });
};
