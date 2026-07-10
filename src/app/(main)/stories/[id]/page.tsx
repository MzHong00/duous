import type { Metadata } from "next";

import { StoryDetailView } from "@/features/stories/components/StoryDetailView";
import { PAGE_TITLES } from "@/constants/seo";

export const metadata: Metadata = { title: PAGE_TITLES.STORY_DETAIL };

export default function Page() {
  return <StoryDetailView />;
}
