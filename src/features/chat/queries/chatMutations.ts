import { useMutation } from "@tanstack/react-query";

import { chatApi } from "@/features/chat/api/chat";

export const useSendMessageMutation = () =>
  useMutation({
    mutationFn: ({
      workspaceId,
      senderId,
      text,
    }: {
      workspaceId: string;
      senderId: string;
      text: string;
    }) => chatApi.send(workspaceId, senderId, text),
  });
