import { useEffect, useRef } from "react";

interface UseChatViewportResult {
  pageRef: React.RefObject<HTMLDivElement | null>;
  bottomRef: React.RefObject<HTMLDivElement | null>;
}

/**
 * iOS Safari 키보드 대응 훅
 * visualViewport 크기·위치에 맞춰 페이지 높이를 갱신하고, scrollDep 변화 시 하단으로 스크롤한다
 */
export const useChatViewport = (scrollDep: unknown): UseChatViewportResult => {
  const pageRef = useRef<HTMLDivElement>(null); // 키보드 높이에 맞춰 크기를 조정할 페이지 컨테이너
  const bottomRef = useRef<HTMLDivElement>(null); // 메시지 목록 최하단 앵커

  // visualViewport 변화에 맞춰 페이지 높이·오프셋을 즉시 동기화 (dvh는 SSR 폴백)
  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport || !pageRef.current) return;

    const update = () => {
      if (!pageRef.current) return;
      pageRef.current.style.height = `${viewport.height}px`;
      pageRef.current.style.top = `${viewport.offsetTop}px`;
      bottomRef.current?.scrollIntoView({ behavior: "instant" });
    };

    update();
    viewport.addEventListener("resize", update);
    viewport.addEventListener("scroll", update);
    return () => {
      viewport.removeEventListener("resize", update);
      viewport.removeEventListener("scroll", update);
    };
  }, []);

  // 새 메시지가 추가되면 부드럽게 하단으로 스크롤
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [scrollDep]);

  return { pageRef, bottomRef };
};
