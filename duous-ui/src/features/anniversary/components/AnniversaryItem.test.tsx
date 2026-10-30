import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AnniversaryItem } from "./AnniversaryItem";

import type { Anniversary } from "@/features/anniversary/types/anniversary";

const baseAnniversary: Anniversary = {
  id: "d-100",
  title: "100일",
  date: "2026-07-07",
  daysLeft: 0,
};

describe("AnniversaryItem", () => {
  it("daysLeft가 0이면 '오늘!' 상태를 표시한다", () => {
    render(<AnniversaryItem anniversary={{ ...baseAnniversary, daysLeft: 0 }} />);

    expect(screen.getByText("오늘!")).toBeInTheDocument();
    expect(screen.queryByText("지남")).not.toBeInTheDocument();
    expect(screen.queryByText(/^D-/)).not.toBeInTheDocument();
  });

  it("daysLeft가 음수이면 '지남' 상태를 표시한다", () => {
    render(<AnniversaryItem anniversary={{ ...baseAnniversary, daysLeft: -5 }} />);

    expect(screen.getByText("지남")).toBeInTheDocument();
    expect(screen.queryByText("오늘!")).not.toBeInTheDocument();
    expect(screen.queryByText(/^D-/)).not.toBeInTheDocument();
  });

  it("daysLeft가 양수이면 D-day 상태를 표시한다", () => {
    render(<AnniversaryItem anniversary={{ ...baseAnniversary, daysLeft: 12 }} />);

    expect(screen.getByText("D-12")).toBeInTheDocument();
    expect(screen.queryByText("오늘!")).not.toBeInTheDocument();
    expect(screen.queryByText("지남")).not.toBeInTheDocument();
  });

  it("제목과 날짜를 표시한다", () => {
    render(<AnniversaryItem anniversary={baseAnniversary} />);

    expect(screen.getByText("100일")).toBeInTheDocument();
    expect(screen.getByText("2026.07.07")).toBeInTheDocument();
  });
});
