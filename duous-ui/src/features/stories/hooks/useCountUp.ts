"use client";
import { useEffect, useState } from "react";

import { useResetOnChange } from "@/hooks/useResetOnChange";

const DURATION_MS = 900; // 카운트업 총 재생 시간

/**
 * 목표 숫자까지 ease-out 곡선으로 부드럽게 차오르는 카운트업 값 반환
 * @param target 최종 표시할 숫자
 */
export const useCountUp = (target: number) => {
  const [count, setCount] = useState(0); // 현재 화면에 표시 중인 숫자
  const targetChanged = useResetOnChange(target);

  // target이 바뀌면 렌더 중 즉시 0으로 리셋해, 이전 target의 최종값이 다음 rAF 틱 전까지 잠깐 보이는 것을 방지
  if (targetChanged) setCount(0);

  // target 변경 시 0→target 카운트업 재생 (rAF 기반, 언마운트 시 정리)
  useEffect(() => {
    if (target === 0) return;

    let rafId = 0;
    const startedAt = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - startedAt) / DURATION_MS, 1);
      const eased = 1 - (1 - progress) ** 3; // ease-out cubic
      setCount(Math.round(target * eased));
      if (progress < 1) rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [target]);

  return count;
};
