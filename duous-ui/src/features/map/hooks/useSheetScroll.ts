"use client";
import { useEffect, useRef } from "react";

/**
 * 시트 안에서 목록 ↔ 상세를 오갈 때의 스크롤 위치를 관리하는 커스텀 훅.
 * 상세는 항상 맨 위에서 시작하고, 목록으로 돌아오면 보고 있던 위치로 되돌린다.
 */
export const useSheetScroll = (detailKey: string | null) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const listScrollTopRef = useRef(0); // 목록을 보고 있던 스크롤 위치

  /** 목록이 보이는 동안의 스크롤 위치를 계속 기록해 둔다 */
  useEffect(() => {
    const el = contentRef.current;
    if (!el || detailKey) return;
    const handleScroll = () => {
      listScrollTopRef.current = el.scrollTop;
    };
    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, [detailKey]);

  /** 상세로 들어가면 맨 위로, 목록으로 나오면 기록해 둔 위치로 스크롤을 맞춘다 */
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    el.scrollTop = detailKey ? 0 : listScrollTopRef.current;
  }, [detailKey]);

  return contentRef;
};
