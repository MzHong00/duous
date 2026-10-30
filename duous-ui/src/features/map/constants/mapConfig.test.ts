import { describe, expect, it } from "vitest";

import { getStoryLineOptions, toLatLngPath } from "./mapConfig";

describe("toLatLngPath", () => {
  it("LocationPoint를 구글 지도 좌표로 변환한다", () => {
    expect(toLatLngPath([{ latitude: 37.5, longitude: 127.0, timestamp: 0 }])).toEqual([
      { lat: 37.5, lng: 127.0 },
    ]);
  });
});

describe("getStoryLineOptions", () => {
  it("밑선은 흰색이며 본선보다 굵고 클릭되지 않는다", () => {
    const { casing, line } = getStoryLineOptions({
      color: "#ff0000",
      isSelected: false,
      hasSelection: false,
    });

    expect(casing.strokeColor).toBe("#FFFFFF");
    expect(casing.strokeWeight).toBeGreaterThan(line.strokeWeight);
    expect(casing.clickable).toBe(false);
    expect(line.clickable).toBe(true);
  });

  it("선택된 경로는 더 굵고 위에 그려진다", () => {
    const selected = getStoryLineOptions({
      color: "#ff0000",
      isSelected: true,
      hasSelection: true,
    });
    const others = getStoryLineOptions({ color: "#00ff00", isSelected: false, hasSelection: true });

    expect(selected.line.strokeWeight).toBeGreaterThan(others.line.strokeWeight);
    expect(selected.line.zIndex).toBeGreaterThan(others.line.zIndex);
    expect(selected.line.strokeOpacity).toBeGreaterThan(others.line.strokeOpacity);
  });

  it("선택이 없으면 모든 경로를 같은 세기로 보여준다", () => {
    const a = getStoryLineOptions({ color: "#ff0000", isSelected: false, hasSelection: false });
    const b = getStoryLineOptions({ color: "#00ff00", isSelected: false, hasSelection: false });

    expect(a.line.strokeOpacity).toBe(b.line.strokeOpacity);
    expect(a.line.strokeOpacity).toBeGreaterThan(0.8);
  });
});
