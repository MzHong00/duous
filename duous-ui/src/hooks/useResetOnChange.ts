"use client";
import { useState } from "react";

/**
 * key가 바뀌면 렌더 중 즉시 이를 감지해 true를 반환한다 (effect 없이 처리해 불필요한 커밋 방지).
 * 반환값이 true인 렌더에서 호출부는 필요한 state를 원하는 값으로 리셋하면 된다.
 * @param key 변경 여부를 추적할 값
 */
export const useResetOnChange = <T>(key: T) => {
  const [prevKey, setPrevKey] = useState(key); // 직전 key 추적용
  const didChange = key !== prevKey;

  if (didChange) setPrevKey(key);

  return didChange;
};
