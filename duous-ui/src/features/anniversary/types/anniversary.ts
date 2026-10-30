/** 기념일 한 건의 표시 정보 */
export interface Anniversary {
  id: string; // 고유 식별자 (예: "d-100", "y-1")
  title: string; // 표시 제목 (예: "100일", "1주년 기념일")
  date: string; // 기념일 날짜 (YYYY-MM-DD)
  daysLeft: number; // 오늘 기준 남은 일수 (음수면 지남)
}
