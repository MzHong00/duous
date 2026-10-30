import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { MapSheetHeader } from "./MapSheetHeader";

const defaultProps = {
  storyCount: 3,
  totalDistanceKm: 6.2,
  totalDurationMin: 32,
  isRecording: false,
  recordingDistanceKm: 0,
  onToggleRecording: vi.fn(),
};

describe("MapSheetHeader", () => {
  it("기록 전에는 누적 요약과 기록 시작 버튼을 보여준다", () => {
    render(<MapSheetHeader {...defaultProps} />);

    expect(screen.getByText("전체 기록")).toBeInTheDocument();
    expect(screen.getByText("6.2km")).toBeInTheDocument();
    expect(screen.getByText("걸은 거리")).toBeInTheDocument();
    expect(screen.getByText("32분")).toBeInTheDocument();
    expect(screen.getByText("3개")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "기록 시작" })).toBeInTheDocument();
  });

  it("기록 중에는 실시간 이동 거리와 종료 버튼으로 바뀐다", () => {
    render(<MapSheetHeader {...defaultProps} isRecording recordingDistanceKm={0.35} />);

    expect(screen.getByText("기록 중")).toBeInTheDocument();
    expect(screen.getByText("350m")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "기록 끝내기" })).toBeInTheDocument();
  });

  it("버튼을 누르면 기록 토글을 호출한다", () => {
    const onToggleRecording = vi.fn();
    render(<MapSheetHeader {...defaultProps} onToggleRecording={onToggleRecording} />);

    fireEvent.click(screen.getByRole("button", { name: "기록 시작" }));

    expect(onToggleRecording).toHaveBeenCalledTimes(1);
  });
});
