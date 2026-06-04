"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Story, LocationPoint } from "@/features/stories/types/story";

interface StoryState {
  isRecording: boolean;
  recordingPath: LocationPoint[];
  stories: Story[];
  selectedStoryId: string | null;
}

const storyStore = create<StoryState>()(
  persist(
    (): StoryState => ({
      isRecording: false,
      recordingPath: [],
      stories: [],
      selectedStoryId: null,
    }),
    {
      name: "story-storage",
      version: 1,
      migrate: () => ({
        isRecording: false,
        recordingPath: [],
        stories: [],
        selectedStoryId: null,
      }),
    }
  )
);

export const useStoryStore = <T = StoryState>(
  selector: (state: StoryState) => T = (state) => state as unknown as T
) => storyStore(selector);

export const storyActions = {
  setStories: (stories: Story[]) => storyStore.setState({ stories }),
  startRecording: () => storyStore.setState({ isRecording: true, recordingPath: [] }),
  stopRecording: () => storyStore.setState({ isRecording: false }),
  setSelectedStoryId: (id: string | null) => storyStore.setState({ selectedStoryId: id }),
  addLocationPoint: (point: LocationPoint) =>
    storyStore.setState((state) => ({
      recordingPath: [...state.recordingPath, point],
    })),
  saveStory: (storyData: {
    id: string;
    title?: string;
    description?: string;
    userId: string;
    workspaceId: string;
    pathColor: string;
  }) =>
    storyStore.setState((state) => {
      const newStory: Story = {
        ...storyData,
        date: new Date().toISOString(),
        path: state.recordingPath,
      };
      return {
        stories: [newStory, ...state.stories],
        recordingPath: [],
        isRecording: false,
      };
    }),
  addStory: (story: Story) =>
    storyStore.setState((state) => ({
      stories: [story, ...state.stories],
    })),
  updateStory: (
    id: string,
    data: {
      title?: string;
      description?: string;
      thumbnailUrl?: string;
      path?: LocationPoint[];
      pathColor?: string;
    }
  ) =>
    storyStore.setState((state) => ({
      stories: state.stories.map((s) => (s.id === id ? { ...s, ...data } : s)),
    })),
  deleteStory: (id: string) =>
    storyStore.setState((state) => ({
      stories: state.stories.filter((s) => s.id !== id),
    })),
  clearRecording: () => storyStore.setState({ recordingPath: [], isRecording: false }),
};
