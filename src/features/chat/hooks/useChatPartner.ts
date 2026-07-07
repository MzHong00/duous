import { useQuery } from "@tanstack/react-query";

import { useCurrentWorkspace } from "@/features/workspace/hooks/useCurrentWorkspace";
import { authQueries } from "@/features/auth/queries/authQueries";
import { DEFAULT_PARTNER } from "@/features/chat/constants/chat";

import type { WorkspaceMember } from "@/features/workspace/types/workspace";

/** 현재 워크스페이스에서 나를 제외한 첫 멤버(파트너)를 반환한다 · 없으면 기본 파트너 */
export const useChatPartner = (): WorkspaceMember => {
  const { currentWorkspace } = useCurrentWorkspace();
  const { data: user } = useQuery(authQueries.user());

  return currentWorkspace?.members?.find((m) => m.id !== user?.id) ?? DEFAULT_PARTNER;
};
