import { useEffect, useRef } from "react";

interface UseChatViewportResult {
  bottomRef: React.RefObject<HTMLDivElement | null>;
}

/**
 * iOS Safari 키보드 대응 훅
 * 키보드가 올라와 visualViewport가 줄어들면 즉시, scrollDep(메시지) 변화 시 부드럽게 하단으로 스크롤한다
 * GNB 탭 페이지는 (main) 레이아웃의 dvh 컨테이너를 그대로 채우므로 페이지 높이 자체는 CSS(height: 100%)에 위임한다
 * scrollIntoView는 overflow: hidden인 조상(.board)까지 스크롤시켜 레이아웃이 위로 밀리므로 메시지 컨테이너만 직접 스크롤한다
 */
export const useChatViewport = (scrollDep: unknown): UseChatViewportResult => {
  const bottomRef = useRef<HTMLDivElement>(null); // 메시지 목록 최하단 앵커

  /** 메시지 스크롤 컨테이너(.messages)만 최하단으로 스크롤 */
  const scrollToBottom = (behavior: ScrollBehavior) => {
    const container = bottomRef.current?.parentElement;
    container?.scrollTo({ top: container.scrollHeight, behavior });
  };

  // 키보드가 열려 visualViewport가 줄어들면 즉시 하단으로 스크롤
  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;

    const handleResize = () => scrollToBottom("instant");

    viewport.addEventListener("resize", handleResize);
    return () => viewport.removeEventListener("resize", handleResize);
  }, []);

  // 새 메시지가 추가되면 부드럽게 하단으로 스크롤
  useEffect(() => {
    scrollToBottom("smooth");
  }, [scrollDep]);

  return { bottomRef };
};
