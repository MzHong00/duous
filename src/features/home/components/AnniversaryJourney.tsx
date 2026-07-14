"use client";
import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";

import { useAnniversaries } from "@/features/anniversary/hooks/useAnniversaries";
import { ROUTES } from "@/constants/routes";
import { cx } from "@/utils/cn";

import styles from "./AnniversaryJourney.module.scss";

import type { CSSProperties } from "react";

const HEART_ICON_SIZE = 11; // 오늘 위치 하트 마커 아이콘 크기(px)
const JOURNEY_STOP_COUNT = 3; // 레일에 표시할 다가오는 기념일 정거장 수

/** 오늘(하트)에서 다가오는 기념일 정거장들로 이어지는 여정 레일 */
export const AnniversaryJourney = () => {
  const router = useRouter();
  const { days, anniversaries } = useAnniversaries();

  const stops = anniversaries.slice(0, JOURNEY_STOP_COUNT); // 레일에 올릴 임박순 기념일 정거장들
  if (!stops.length) return null;

  // 시작일→다음 기념일 구간에서 오늘이 어디쯤인지(0~1) — 레일 첫 구간 안에서만 차오르도록 정거장 수로 나눈다
  const progressInFirstSegment = Math.min(1, days / (days + stops[0].daysLeft));
  const fillRatio = progressInFirstSegment / stops.length;

  return (
    <button
      type="button"
      onClick={() => router.push(ROUTES.ANNIVERSARY.path)}
      className={styles.journey}
      // 진행률은 런타임 값이라 CSS 변수로만 주입한다 (스타일 선언은 SCSS 모듈에 위치)
      style={{ "--fill-ratio": fillRatio } as CSSProperties}
      aria-label={`다음 기념일 ${stops[0].title}까지 ${stops[0].daysLeft}일 남음, 기념일 페이지로 이동`}
    >
      <div className={styles.railLine} />
      <div className={styles.railFill} />

      <div className={styles.nodes}>
        {/* 오늘 위치: 하트 마커 */}
        <div className={styles.node}>
          <span className={styles.todayDot}>
            <Heart size={HEART_ICON_SIZE} className={styles.todayHeart} />
          </span>
          <span className={styles.nodeLabel}>오늘</span>
          <span className={styles.nodeSub}>{days}일째</span>
        </div>

        {/* 다가오는 기념일 정거장들 (첫 정거장이 다음 목적지) */}
        {stops.map((stop, index) => (
          <div key={stop.id} className={cx(styles.node, index === 0 && styles.nextNode)}>
            <span className={styles.dot} />
            <span className={styles.nodeLabel}>{stop.title}</span>
            <span className={styles.nodeSub}>
              {stop.daysLeft === 0 ? "D-Day" : `D-${stop.daysLeft}`}
            </span>
          </div>
        ))}
      </div>
    </button>
  );
};
