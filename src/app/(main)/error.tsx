"use client";

import { ErrorFallback } from "@/components/fallback/ErrorFallback";

interface ErrorPageProps {
  error: Error & { digest?: string }; // Next.js가 전달하는 렌더링 에러
  reset: () => void; // 세그먼트를 재렌더링해 복구를 시도하는 함수
}

/** (main) 세그먼트(홈/캘린더/투두 등) 렌더링 실패 시 노출되는 Error Boundary */
const MainError = ({ reset }: ErrorPageProps) => {
  // error.message는 서버/DB 등 내부 에러 문구가 그대로 담길 수 있어 사용자에게 노출하지 않는다(ErrorFallback 기본 안내 문구 사용)
  return <ErrorFallback onRetry={reset} />;
};

export default MainError;
