import { useMemo } from "react";

const BIG_CARD_COUNT = 5; // 중앙에 겹쳐 쌓을 큰 카드 개수(최근 기억)
const MAX_SMALL_CARD_COUNT = 15; // 장판 사방에 흩뿌릴 작은 카드 최대 개수

interface UseMemoryBoardResult<T> {
  bigItems: T[]; // 중앙에 겹쳐 쌓이는 큰 카드 목록(최신순 앞 5개)
  smallItems: T[]; // 큰 카드 뭉치 주변에 흩뿌려지는 작은 카드 목록(최대 15개)
}

/**
 * 최근 기억 목록을 "중앙에 겹쳐 쌓인 큰 카드 뭉치 + 주변에 흩뿌려진 작은 카드"로
 * 나누는 훅. 최신순으로 정렬된 items의 앞 5개는 큰 카드, 그 다음 최대 15개는
 * 작은 카드가 된다. 개수가 부족하면 있는 만큼만 반환한다.
 */
export const useMemoryBoard = <T>(items: T[]): UseMemoryBoardResult<T> => {
  return useMemo(
    () => ({
      bigItems: items.slice(0, BIG_CARD_COUNT),
      smallItems: items.slice(BIG_CARD_COUNT, BIG_CARD_COUNT + MAX_SMALL_CARD_COUNT),
    }),
    [items]
  );
};
