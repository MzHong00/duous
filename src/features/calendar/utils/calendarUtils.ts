import { getIntermediateDates } from "@/utils/date";

interface DateRangeItem {
  startDate: string;
  endDate: string;
  color: string;
}

/** 시작·종료일 범위에 속한 모든 날짜별로 색상 점을 누적한다 */
export const buildMarkedDates = (items: DateRangeItem[]): Record<string, string[]> => {
  const marks: Record<string, string[]> = {};
  items.forEach((item) => {
    const range = [
      item.startDate,
      ...getIntermediateDates(item.startDate, item.endDate),
      item.endDate,
    ];
    [...new Set(range)].forEach((date) => {
      if (!marks[date]) marks[date] = [];
      if (!marks[date].includes(item.color)) marks[date].push(item.color);
    });
  });
  return marks;
};
