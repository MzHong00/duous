import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { formatChatTime } from "@/utils/date";

import { MessageBubble } from "./MessageBubble";

const CREATED_AT = "2026-07-01T06:04:00Z"; // 표시 문자열은 실행 타임존에 따라 달라지므로 formatChatTime으로 기대값을 계산한다
const CREATED_AT_LATER = "2026-07-01T06:05:00Z";

/** 기본 props에 덮어쓰기를 적용해 렌더링한다 */
const renderBubble = (
  overrides: Partial<{
    text: string;
    isMine: boolean;
    createdAt: string;
    avatar?: string;
    name?: string;
    isFirstInGroup: boolean;
    isLastInGroup: boolean;
  }> = {}
) =>
  render(
    <MessageBubble
      text="안녕"
      isMine
      createdAt={CREATED_AT}
      isFirstInGroup
      isLastInGroup
      {...overrides}
    />
  );

describe("MessageBubble", () => {
  it("메시지 텍스트를 렌더링한다", () => {
    renderBubble({ text: "밥 먹었어?" });

    expect(screen.getByText("밥 먹었어?")).toBeInTheDocument();
  });

  it("내 메시지는 상대 아바타 없이 렌더링한다", () => {
    renderBubble({ isMine: true, name: "파트너", avatar: "https://cdn.test/a.png" });

    expect(screen.queryByAltText("파트너")).not.toBeInTheDocument();
  });

  it("상대 메시지의 그룹 첫 메시지에는 아바타를 렌더링한다", () => {
    renderBubble({
      isMine: false,
      name: "파트너",
      avatar: "https://cdn.test/a.png",
      isFirstInGroup: true,
    });

    expect(screen.getByAltText("파트너")).toBeInTheDocument();
  });

  it("상대 메시지의 그룹 중간 메시지에는 아바타를 렌더링하지 않는다", () => {
    renderBubble({
      isMine: false,
      name: "파트너",
      avatar: "https://cdn.test/a.png",
      isFirstInGroup: false,
    });

    expect(screen.queryByAltText("파트너")).not.toBeInTheDocument();
  });

  it("상대 이름이 없으면 이니셜 폴백 문자를 표시한다", () => {
    renderBubble({ isMine: false, name: undefined, isFirstInGroup: true });

    expect(screen.getByText("?")).toBeInTheDocument();
  });

  it("그룹 마지막 메시지에는 시간을 표시한다", () => {
    renderBubble({ createdAt: CREATED_AT, isLastInGroup: true });

    expect(screen.getByText(formatChatTime(CREATED_AT))).toBeInTheDocument();
  });

  it("그룹 마지막이 아니면 시간을 표시하지 않는다", () => {
    renderBubble({ createdAt: CREATED_AT, isLastInGroup: false });

    expect(screen.queryByText(formatChatTime(CREATED_AT))).not.toBeInTheDocument();
  });

  it("상대 메시지도 그룹 마지막이면 시간을 표시한다", () => {
    renderBubble({
      isMine: false,
      name: "파트너",
      createdAt: CREATED_AT_LATER,
      isLastInGroup: true,
    });

    expect(screen.getByText(formatChatTime(CREATED_AT_LATER))).toBeInTheDocument();
  });
});
