import { useMemo } from "react";

import { useCurrentWorkspace } from "@/features/workspace/hooks/useCurrentWorkspace";
import { calculateDDay, getDateWithOffset, getDaysUntil, addYears } from "@/utils/date";
import {
  DDAY_MILESTONES,
  YEARLY_MILESTONES,
  ANNIVERSARY_DISPLAY_COUNT,
} from "@/features/anniversary/constants/anniversary";

import type { Anniversary } from "@/features/anniversary/types/anniversary";

/** 시작일 기준으로 일수·주년 기념일 목록을 만들어 임박순으로 정렬해 노출 개수만큼 반환 */
const generateAnniversaries = (startDate: string): Anniversary[] => {
  const ddayAnniversaries = DDAY_MILESTONES.map((days) => {
    const date = getDateWithOffset(days - 1, startDate); // 시작일이 1일째이므로 1을 뺀다
    return { id: `d-${days}`, title: `${days}일`, date, daysLeft: getDaysUntil(date) };
  });

  const yearlyAnniversaries = YEARLY_MILESTONES.map((year) => {
    const date = addYears(startDate, year);
    return { id: `y-${year}`, title: `${year}주년 기념일`, date, daysLeft: getDaysUntil(date) };
  });

  return [...ddayAnniversaries, ...yearlyAnniversaries]
    .sort((a, b) => a.daysLeft - b.daysLeft)
    .slice(0, ANNIVERSARY_DISPLAY_COUNT);
};

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
