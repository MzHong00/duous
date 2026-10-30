import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { StoryLineList } from "./StoryLineList";

import type { Story } from "@/features/stories/types/story";

const story: Story = {
  id: "story-1",
  title: "한강 산책",
  date: "2026-03-01",
  path: [
    { latitude: 37.5, longitude: 127.0, timestamp: 0 },
    { latitude: 37.51, longitude: 127.0, timestamp: 600_000 },
  ],
  pathColor: "#ff0000",
  userId: "user-1",
  workspaceId: "ws-1",
};

describe("StoryLineList", () => {
  it("스토리마다 제목과 이동 기록을 보여준다", () => {
    render(<StoryLineList stories={[story]} onSelectStory={vi.fn()} />);

    expect(screen.getByText("한강 산책")).toBeInTheDocument();
    expect(screen.getByText("2026.03.01")).toBeInTheDocument();
    expect(screen.getByText("1.1km")).toBeInTheDocument();
    expect(screen.getByText("10분")).toBeInTheDocument();
  });

  it("제목이 없으면 대체 라벨을 표시한다", () => {
    render(<StoryLineList stories={[{ ...story, title: undefined }]} onSelectStory={vi.fn()} />);

    expect(screen.getByText("제목 없는 스토리")).toBeInTheDocument();
  });

  it("스토리가 없으면 기록을 시작하도록 안내한다", () => {
    render(<StoryLineList stories={[]} onSelectStory={vi.fn()} />);

    expect(screen.getByText("아직 남긴 경로가 없어요")).toBeInTheDocument();
  });

  it("항목을 누르면 해당 스토리를 선택한다", () => {
    const onSelectStory = vi.fn();
    render(<StoryLineList stories={[story]} onSelectStory={onSelectStory} />);

    fireEvent.click(screen.getByText("한강 산책"));

    expect(onSelectStory).toHaveBeenCalledWith("story-1");
  });
});
