"use client";
import { useQuery } from "@tanstack/react-query";
import { Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

import { authQueries } from "@/features/auth/queries/authQueries";
import { useAnniversaries } from "@/features/anniversary/hooks/useAnniversaries";
import { ROUTES } from "@/constants/routes";
import { cx } from "@/utils/cn";
import { formatDate } from "@/utils/date";

import styles from "./AnniversarySpotlight.module.scss";

const SPARKLE_ICON_SIZE = 13; // 기념일 라벨 옆 반짝임 아이콘 크기(px)
const AFTERNOON_START_HOUR = 12; // 오후 인사말 시작 시각
const EVENING_START_HOUR = 18; // 저녁 인사말 시작 시각
const NIGHT_START_HOUR = 22; // 밤 인사말 시작 시각
const MORNING_START_HOUR = 5; // 아침 인사말 시작 시각

/** 현재 시각대에 맞는 인사말 문구를 반환 */
const getTimeGreeting = (hour: number): string => {
  if (hour >= NIGHT_START_HOUR || hour < MORNING_START_HOUR) return "포근한 밤이에요";
  if (hour >= EVENING_START_HOUR) return "좋은 저녁이에요";
  if (hour >= AFTERNOON_START_HOUR) return "좋은 오후예요";
  return "좋은 아침이에요";
};

/** 홈 중앙의 시간대별 인사말 + 폴라로이드 감성 기념일 카운트다운 스포트라이트 */
export const AnniversarySpotlight = () => {
  const router = useRouter();
  const { data: user } = useQuery(authQueries.user());
  const { anniversaries } = useAnniversaries();

  const nextEvent = anniversaries[0]; // 가장 임박한 기념일
  const greeting = getTimeGreeting(new Date().getHours());
  const isDDay = nextEvent?.daysLeft === 0;

  return (
    <section className={styles.spotlight}>
      <div className={styles.greeting}>
        <p className={styles.greetingLine}>
          {greeting}
          {user?.name ? `, ${user.name}님` : ""}
        </p>
        <p className={styles.greetingSub}>오늘의 순간도 소중하게 기록해보세요</p>
      </div>

      {nextEvent && (
        <button
          type="button"
          onClick={() => router.push(ROUTES.ANNIVERSARY.path)}
          className={cx(styles.polaroid, isDDay && styles.isTodayAnniversary)}
          aria-label={`다가오는 기념일 ${nextEvent.title}, ${isDDay ? "오늘" : `${nextEvent.daysLeft}일 남음`}, 기념일 페이지로 이동`}
        >
          <div className={styles.polaroidInner}>
            <span className={styles.eventLabel}>
              <Sparkles size={SPARKLE_ICON_SIZE} className={styles.sparkle} />
              {isDDay ? "축하해요! 오늘인 기념일" : "다가오는 기념일"}
            </span>
            <span className={styles.eventDDay}>{isDDay ? "D-Day" : `D-${nextEvent.daysLeft}`}</span>
            <span className={styles.eventTitle}>{nextEvent.title}</span>
          </div>
          <span className={styles.polaroidCaption}>
            {formatDate(nextEvent.date, "YYYY. MM. DD (ddd)")}
          </span>
        </button>
      )}
    </section>
  );
};
