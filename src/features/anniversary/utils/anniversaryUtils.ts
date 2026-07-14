import { getDateWithOffset, getDaysUntil, addYears } from "@/utils/date";
import {
  DDAY_MILESTONES,
  YEARLY_MILESTONES,
  ANNIVERSARY_DISPLAY_COUNT,
} from "@/features/anniversary/constants/anniversary";

import type { Anniversary } from "@/features/anniversary/types/anniversary";

/** 시작일 기준 일수·주년 마일스톤 전체를 임박순으로 정렬해 생성 */
const generateAllMilestones = (startDate: string): Anniversary[] => {
  const ddayAnniversaries = DDAY_MILESTONES.map((days) => {
    const date = getDateWithOffset(days - 1, startDate); // 시작일이 1일째이므로 1을 뺀다
    return { id: `d-${days}`, title: `${days}일`, date, daysLeft: getDaysUntil(date) };
  });

  const yearlyAnniversaries = YEARLY_MILESTONES.map((year) => {
    const date = addYears(startDate, year);
    return { id: `y-${year}`, title: `${year}주년 기념일`, date, daysLeft: getDaysUntil(date) };
  });

  return [...ddayAnniversaries, ...yearlyAnniversaries].sort((a, b) => a.daysLeft - b.daysLeft);
};

/** 시작일 기준으로 다가오는 기념일 목록을 임박순으로 노출 개수만큼 반환 */
export const generateAnniversaries = (startDate: string): Anniversary[] =>
  generateAllMilestones(startDate)
    .filter((anniversary) => anniversary.daysLeft >= 0) // 이미 지난 기념일은 "다가오는 기념일" 목록에서 제외
    .slice(0, ANNIVERSARY_DISPLAY_COUNT);

/** 가장 최근에 지난 기념일을 반환 (지난 기념일이 없으면 null) */
export const getPreviousAnniversary = (startDate: string): Anniversary | null => {
  const passed = generateAllMilestones(startDate).filter(
    (anniversary) => anniversary.daysLeft < 0
  );
  return passed.at(-1) ?? null; // 임박순 정렬이므로 마지막 원소가 가장 최근에 지난 기념일
};
