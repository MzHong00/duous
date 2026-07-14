import { describe, expect, it } from "vitest";

import { PATH_COLORS } from "@/constants/theme";
import { rowToStory } from "@/features/stories/utils/storyUtils";

import type { StoryRow } from "@/features/stories/utils/storyUtils";

describe("rowToStory", () => {
  it("Supabase row를 Story 타입으로 변환한다", () => {
    const row: StoryRow = {
      id: "story-1",
      workspace_id: "ws-1",
      user_id: "user-1",
      title: "제주 여행",
      description: "즐거운 하루",
      date: "2026-07-01",
      thumbnail_url: "https://example.com/thumb.png",
      path: [{ latitude: 33.4, longitude: 126.5, timestamp: 1751328000000 }],
      path_color: "#ff0000",
    };

    expect(rowToStory(row)).toEqual({
      id: "story-1",
      title: "제주 여행",
      description: "즐거운 하루",
      date: "2026-07-01",
      thumbnailUrl: "https://example.com/thumb.png",
      path: [{ latitude: 33.4, longitude: 126.5, timestamp: 1751328000000 }],
      pathColor: "#ff0000",
      userId: "user-1",
      workspaceId: "ws-1",
    });
  });

  it("path가 없으면 빈 배열로, path_color가 없으면 기본 색상으로 대체한다", () => {
    const row = {
      id: "story-2",
      workspace_id: "ws-1",
      user_id: "user-1",
      date: "2026-07-01",
      path: undefined,
      path_color: undefined,
    } as unknown as StoryRow;

    const story = rowToStory(row);

    expect(story.path).toEqual([]);
    expect(story.pathColor).toBe(PATH_COLORS[0]);
  });
});
