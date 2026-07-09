"use client";
import { useEffect, useMemo, useRef, useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { Camera, RotateCcw, X } from "lucide-react";
import { useRouter } from "next/navigation";

import { storyQueries } from "@/features/stories/queries/storyQueries";
import { useCurrentWorkspace } from "@/features/workspace/hooks/useCurrentWorkspace";
import { ROUTES } from "@/constants/routes";

import { useMemoryBoard } from "../hooks/useMemoryBoard";
import { useScatterCards } from "../hooks/useScatterCards";

import { SHELL_STORIES, isShellStory } from "@/features/stories/constants/previewMockStories";
import { StoryDetailContent } from "@/features/stories/components/StoryDetailContent";
import { MemoryCard } from "./MemoryCard";
import { StoryBoardHeader } from "./StoryBoardHeader";

import styles from "./StoryBoardView.module.scss";

const SKELETON_KEYS = ["skeleton-1", "skeleton-2", "skeleton-3"]; // 로딩 스켈레톤 카드 개수(3장)
const CENTER_MOVE_MS = 450; // 카드가 보드 중앙으로 이동하는 시간(이후 상세 오버레이를 펼침)
const SWIPE_CLOSE_THRESHOLD = 90; // 이 거리(px)를 넘겨 놓으면 상세 오버레이가 그 방향으로 날아가며 닫힘
const SWIPE_FADE_DISTANCE = 260; // 이 거리(px)만큼 스와이프하면 완전히 투명해지는 기준
const SWIPE_OUT_MS = 280; // 스와이프 아웃 애니메이션 시간(ms)
const SWIPE_TRANSITION = `transform ${SWIPE_OUT_MS}ms ease, opacity ${SWIPE_OUT_MS}ms ease`;
const BOARD_STORY_COUNT = 20; // 보드를 채우는 목표 스토리 수(부채꼴 5장 + 흩어진 카드 15장, 실 스토리 + 껍데기)

export const StoryBoardView = () => {
  const boardRef = useRef<HTMLDivElement>(null); // 카드가 튕겨야 할 실제 벽(보드) 경계
  const collageRef = useRef<HTMLDivElement>(null); // 카드 transform의 기준 좌표계(offsetParent)
  const dragStartXRef = useRef<number | null>(null); // 부채꼴 카드 드래그 시작 X 좌표
  const dragStartIndexRef = useRef<number>(0); // 드래그 시작 당시의 활성화 인덱스
  const didDragRef = useRef<boolean>(false); // 드래그로 인덱스가 바뀌었는지(직후 클릭 되튐 방지용)

  const router = useRouter();
  const { currentWorkspace } = useCurrentWorkspace();

  const {
    data: stories = [],
    isPending: isStoriesPending,
    isError: isStoriesError,
    refetch: refetchStories,
  } = useQuery(storyQueries.list(currentWorkspace?.id ?? ""));

  // 실 스토리 뒤에 부족분만큼 껍데기를 붙여 보드를 항상 BOARD_STORY_COUNT개로 채움(목록 화면에는 영향 없음)
  const boardStories = useMemo(
    () => [
      ...stories,
      ...SHELL_STORIES(currentWorkspace?.id ?? "", BOARD_STORY_COUNT - stories.length),
    ],
    [stories, currentWorkspace?.id]
  );
  const { bigItems, smallItems } = useMemoryBoard(boardStories);
  const [currentIndex, setCurrentIndex] = useState(0); // 부채꼴 최상단(활성) 카드 인덱스
  const [focus, setFocus] = useState<{ id: string; dx: number; dy: number } | null>(null); // 보드 정중앙으로 이동한 카드 id와 이동량(px)
  const [detailId, setDetailId] = useState<string | null>(null); // 상세 오버레이로 펼쳐진 스토리 id(없으면 null)
  const detailTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined); // 중앙 이동 완료 후 상세를 여는 예약 타이머
  const detailOverlayRef = useRef<HTMLDivElement>(null); // 상세 오버레이 엘리먼트(스와이프 중 transform 직접 제어)
  const detailSwipeRef = useRef<{ x: number; y: number; engaged: boolean } | null>(null); // 상세 오버레이 좌우 스와이프 시작 좌표·가로 스와이프 진입 여부
  const dismissTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined); // 스와이프 아웃 애니메이션 후 언마운트 예약 타이머
  const {
    setCardRef,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    bringToCenter,
    resetFocus,
  } = useScatterCards(collageRef, boardRef, smallItems.length);

  // 언마운트 시 상세 열기/스와이프 아웃 예약 타이머 정리
  useEffect(
    () => () => {
      clearTimeout(detailTimerRef.current);
      clearTimeout(dismissTimerRef.current);
    },
    []
  );

  if (!currentWorkspace) return null;

  const detailStory = detailId ? boardStories.find((story) => story.id === detailId) : null; // 상세 오버레이에 표시할 스토리

  const handleDragStart = (e: React.PointerEvent) => {
    dragStartXRef.current = e.clientX;
    dragStartIndexRef.current = currentIndex;
    didDragRef.current = false;
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handleDragMove = (e: React.PointerEvent) => {
    if (dragStartXRef.current === null) return;
    const diffX = e.clientX - dragStartXRef.current;
    // 130px 드래그할 때마다 한 장씩 인덱스 변경
    const indexOffset = Math.round(diffX / 130);
    let nextIndex = (dragStartIndexRef.current - indexOffset) % bigItems.length;
    if (nextIndex < 0) nextIndex += bigItems.length;
    if (nextIndex !== currentIndex) {
      didDragRef.current = true;
      closeDetail(); // 액티브가 바뀌면 중앙 이동/상세를 닫고 원래 자리로 복귀
      setCurrentIndex(nextIndex);
    }
  };

  const handleDragEnd = (e: React.PointerEvent) => {
    dragStartXRef.current = null;
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  // 카드를 중앙으로 보낸 뒤 이동이 끝나면 상세 오버레이를 펼침
  const scheduleDetail = (id: string) => {
    clearTimeout(detailTimerRef.current);
    detailTimerRef.current = setTimeout(() => setDetailId(id), CENTER_MOVE_MS);
  };

  // 상세 오버레이를 닫고 중앙 이동한 카드(부채꼴·작은 카드 모두)를 원래 자리로 복귀
  const closeDetail = () => {
    clearTimeout(detailTimerRef.current);
    setDetailId(null);
    setFocus(null);
    resetFocus();
  };

  // 부채꼴 카드 탭 → 비액티브는 먼저 활성화, 액티브 카드는 중앙 이동 후 상세 오버레이를 펼침
  const handleFanCardClick = (
    index: number,
    isActive: boolean,
    id: string,
    e: React.MouseEvent<HTMLDivElement>
  ) => {
    // 드래그로 카드를 넘긴 직후 발생하는 클릭은 무시
    if (didDragRef.current) {
      didDragRef.current = false;
      return;
    }
    if (!isActive) {
      closeDetail(); // 액티브가 바뀌면 중앙 이동/상세를 닫고 복귀
      setCurrentIndex(index); // 비활성 카드는 중앙으로 갈 수 없고 활성화만 함
      return;
    }
    if (focus?.id === id) return; // 이미 중앙으로 이동 중/상세 표시 중이면 무시

    const board = collageRef.current;
    if (!board) return;
    const boardRect = board.getBoundingClientRect();
    const cardRect = e.currentTarget.getBoundingClientRect();

    resetFocus(); // 흩뿌려진 카드의 중앙 이동을 먼저 해제(중앙은 항상 한 장만)
    // 카드 중심을 보드 중심으로 옮기기 위한 이동량(부채꼴 자체 변형이 없어 px가 보드 좌표와 1:1)
    const dx = boardRect.left + boardRect.width / 2 - (cardRect.left + cardRect.width / 2);
    const dy = boardRect.top + boardRect.height / 2 - (cardRect.top + cardRect.height / 2);
    setFocus({ id, dx, dy });
    scheduleDetail(id);
  };

  // 흩뿌려진 작은 카드 탭 → 중앙 이동 후 상세 오버레이를 펼침(부채꼴 중앙 카드는 함께 해제)
  const handleSmallCardClick = (index: number, id: string) => {
    setFocus(null);
    bringToCenter(index);
    scheduleDetail(id);
  };

  const handleDetailPointerDown = (e: React.PointerEvent) => {
    const el = detailOverlayRef.current;
    if (!el) return;
    detailSwipeRef.current = { x: e.clientX, y: e.clientY, engaged: false };
    el.style.animation = "none"; // 등장 애니메이션이 인라인 transform을 덮지 않도록 제거
    el.style.transition = "none"; // 손가락을 즉시 따라오도록 트랜지션 끄기
  };

  const handleDetailPointerMove = (e: React.PointerEvent) => {
    const swipe = detailSwipeRef.current;
    const el = detailOverlayRef.current;
    if (!swipe || !el) return;

    const dx = e.clientX - swipe.x;
    const dy = e.clientY - swipe.y;
    // 세로 스크롤과 구분: 가로 이동이 우세할 때만 스와이프로 진입
    if (!swipe.engaged) {
      if (Math.abs(dx) < 8 || Math.abs(dx) <= Math.abs(dy)) return;
      swipe.engaged = true;
    }
    // 스와이프한 만큼 오버레이를 이동시키고 거리에 비례해 투명하게
    el.style.transform = `translateX(${dx}px)`;
    el.style.opacity = String(Math.max(0, 1 - Math.abs(dx) / SWIPE_FADE_DISTANCE));
  };

  const handleDetailPointerUp = (e: React.PointerEvent) => {
    const swipe = detailSwipeRef.current;
    const el = detailOverlayRef.current;
    detailSwipeRef.current = null;
    if (!swipe || !el) return;

    const dx = e.clientX - swipe.x;
    el.style.transition = SWIPE_TRANSITION;

    if (swipe.engaged && Math.abs(dx) > SWIPE_CLOSE_THRESHOLD) {
      // 스와이프 방향으로 화면 밖까지 날려보내며 사라지게 한 뒤 언마운트
      const direction = dx > 0 ? 1 : -1;
      el.style.transform = `translateX(${direction * window.innerWidth}px)`;
      el.style.opacity = "0";
      clearTimeout(dismissTimerRef.current);
      dismissTimerRef.current = setTimeout(closeDetail, SWIPE_OUT_MS);
    } else {
      // 임계값 미만이면 제자리로 부드럽게 복귀
      el.style.transform = "translateX(0)";
      el.style.opacity = "1";
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.board} ref={boardRef}>
        {/* 상단 플로팅 오버레이: 스토리 통계 + 목록 진입 버튼 */}
        <StoryBoardHeader
          stories={stories}
          onListClick={() => router.push(ROUTES.STORIES.LIST.path)}
        />

        <div className={styles.centerContent}>
          {isStoriesPending && (
            <div className={styles.skeletonContainer}>
              {SKELETON_KEYS.map((key) => (
                <div key={key} className={styles.skeletonCard} aria-hidden="true" />
              ))}
            </div>
          )}

          {isStoriesError && (
            <div className={styles.errorState}>
              <Camera size={40} className={styles.errorIcon} />
              <p className={styles.errorTitle}>기억을 불러오지 못했어요</p>
              <button type="button" onClick={() => refetchStories()} className={styles.errorRetry}>
                <RotateCcw size={12} />
                다시 시도
              </button>
            </div>
          )}

          {!isStoriesPending && !isStoriesError && (
            <div className={styles.collageContainer} ref={collageRef}>
              <div
                className={styles.bigStack}
                onPointerDown={handleDragStart}
                onPointerMove={handleDragMove}
                onPointerUp={handleDragEnd}
                onPointerCancel={handleDragEnd}
              >
                {bigItems.map((story, idx) => {
                  let diff = idx - currentIndex;
                  const totalLength = bigItems.length;
                  const half = Math.floor(totalLength / 2);
                  if (diff > half) {
                    diff -= totalLength;
                  } else if (diff < -half) {
                    diff += totalLength;
                  }
                  const rotate = diff * 16;
                  const translateX = diff * 70;
                  const translateY = Math.abs(diff) * 15;

                  const zIndex = 10 - Math.abs(diff);
                  const scale = Math.max(0.75, 1 - Math.abs(diff) * 0.08);
                  const opacity = Math.abs(diff) > 2 ? 0 : diff < 0 ? 0.6 : 1;
                  const pointerEvents: React.CSSProperties["pointerEvents"] =
                    opacity === 0 ? "none" : "auto";

                  const isFocused = focus?.id === story.id;
                  // 중앙으로 이동한 카드는 부채꼴 위치에 이동량(dx·dy)을 더해 형태·크기 그대로 보드 정중앙으로 보냄
                  const offsetX = translateX + (isFocused ? focus.dx : 0);
                  const offsetY = translateY + (isFocused ? focus.dy : 0);

                  return (
                    <div
                      key={story.id}
                      className={styles.fannedCard}
                      style={{
                        transform: `translate3d(calc(-50% + ${offsetX}px), calc(-50% + ${offsetY}px), 0) rotate(${rotate}deg) scale(${scale})`,
                        zIndex: isFocused ? 50 : zIndex,
                        opacity: isFocused ? 1 : opacity,
                        pointerEvents,
                      }}
                      onClick={(e) => handleFanCardClick(idx, diff === 0, story.id, e)}
                    >
                      <MemoryCard story={story} showDate={true} isShell={isShellStory(story)} />
                    </div>
                  );
                })}
              </div>
              {smallItems.map((story, index) => (
                <div
                  key={story.id}
                  ref={setCardRef(index)}
                  className={styles.smallCard}
                  onPointerDown={handlePointerDown(index)}
                  onPointerMove={handlePointerMove(index)}
                  onPointerUp={handlePointerUp(index)}
                  onPointerCancel={handlePointerUp(index)}
                  onClick={() => handleSmallCardClick(index, story.id)}
                >
                  <div className={styles.floatWrap}>
                    <MemoryCard story={story} isShell={isShellStory(story)} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 상세 펼침 오버레이 (보드 전체를 상단까지 덮음) */}
        {detailStory && (
          <div
            ref={detailOverlayRef}
            className={styles.detailOverlay}
            onPointerDown={handleDetailPointerDown}
            onPointerMove={handleDetailPointerMove}
            onPointerUp={handleDetailPointerUp}
            onPointerCancel={handleDetailPointerUp}
          >
            <button
              type="button"
              onClick={closeDetail}
              className={styles.detailClose}
              aria-label="상세 닫기"
            >
              <X size={20} />
            </button>
            <StoryDetailContent story={detailStory} />
          </div>
        )}
      </div>
    </div>
  );
};
