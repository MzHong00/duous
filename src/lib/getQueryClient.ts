import { QueryClient } from "@tanstack/react-query";
import { cache } from "react";

const SERVER_STALE_TIME_MS = 60 * 1000; // 서버 prefetch 데이터의 신선도 유지 시간 (1분)

/** 서버 컴포넌트용 QueryClient — React cache로 요청 단위 재사용 */
export const getQueryClient = cache(
  () =>
    new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: SERVER_STALE_TIME_MS,
        },
      },
    })
);
