import { useMemo } from "react";

import { useCurrentWorkspace } from "@/features/workspace/hooks/useCurrentWorkspace";
import { calculateDDay } from "@/utils/date";
import { generateAnniversaries } from "@/features/anniversary/utils/anniversaryUtils";

/** 현재 워크스페이스 시작일 기반 함께한 일수와 다가오는 기념일 목록을 제공한다 */
export const useAnniversaries = () => {
  const { currentWorkspace } = useCurrentWorkspace();
  const startDate = currentWorkspace?.startDate;

  // 시작일 기준 함께한 일수
  const days = startDate ? calculateDDay(startDate) : 0;

  // 시작일 변경 시에만 기념일 목록 재계산
  const anniversaries = useMemo(
    () => (startDate ? generateAnniversaries(startDate) : []),
    [startDate]
  );

  return { startDate, days, anniversaries };
};
